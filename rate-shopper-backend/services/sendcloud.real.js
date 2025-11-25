import https from 'https';

export async function getShippingProducts(params) {
    const {
        from_country,
        to_country,
        from_postal_code,
        to_postal_code,
        weight,
        max_package_weight,
        package_count,
        length,
        width,
        height
    } = params;

    const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
    const secretKey = process.env.SENDCLOUD_SECRET_KEY;

    if (!publicKey || !secretKey) {
        throw new Error('Credenciales de Sendcloud no configuradas');
    }

    // Construir parámetros incluyendo dimensiones para peso volumétrico
    const queryParams = new URLSearchParams({
        from_country,
        to_country,
        from_postal_code,
        to_postal_code,
        weight: max_package_weight.toString(),
        weight_unit: 'kilogram'
    });

    // Añadir dimensiones si están disponibles (para cálculo de peso volumétrico)
    if (length && width && height) {
        queryParams.append('parcel_length', length.toString());
        queryParams.append('parcel_width', width.toString());
        queryParams.append('parcel_height', height.toString());
        queryParams.append('parcel_height_unit', 'centimeter');
        queryParams.append('parcel_width_unit', 'centimeter');
        queryParams.append('parcel_length_unit', 'centimeter');
    }

    try {
        // 1. Obtener productos disponibles (basado en peso unitario)
        const productsUrl = `https://panel.sendcloud.sc/api/v2/shipping-products?${queryParams}`;
        console.log('\n📡 API Call: /shipping-products');
        console.log('   URL params:', queryParams.toString().substring(0, 100) + '...');

        let productsData;
        try {
            productsData = await makeRequest(productsUrl, publicKey, secretKey);
            console.log('   ✓ Products fetched successfully');
        } catch (error) {
            console.error('   ✗ Error fetching shipping products:', error.message);
            throw error;
        }

        let products;
        try {
            products = JSON.parse(productsData);
        } catch (error) {
            throw new Error(`Error parseando respuesta de shipping-products: ${error.message}`);
        }

        if (!Array.isArray(products)) {
            console.warn('Formato inesperado en shipping-products:', products);
            return { shipping_products: [] };
        }

        // 2. Extraer todos los métodos de envío
        const methods = [];
        products.forEach(product => {
            if (product.methods && Array.isArray(product.methods)) {
                product.methods.forEach(method => {
                    // Añadir metadatos del producto padre al método
                    method.carrier = product.carrier;
                    method.currency = 'EUR'; // Default
                    methods.push(method);
                });
            }
        });

        console.log(`   📋 Métodos extraídos: ${methods.length}`);
        console.log(`   🏢 Carriers: ${[...new Set(methods.map(m => m.carrier))].join(', ')}`);

        // 3. Obtener precios para cada método EN BATCHES para evitar rate limiting
        console.log('\n💰 Fetching prices...');
        // IMPORTANTE: La API devuelve el precio TOTAL del envío completo,
        // no precio unitario. Sendcloud calcula automáticamente basado en
        // el peso total y número de paquetes en su backend.

        // Función auxiliar para procesar en batches
        async function processBatch(batch) {
            return Promise.all(batch.map(async (method) => {
                try {
                    const priceParams = new URLSearchParams({
                        shipping_method_id: method.id,
                        from_country,
                        to_country,
                        weight: weight.toString(), // Peso TOTAL del envío
                        weight_unit: 'kilogram',
                        from_postal_code,
                        to_postal_code
                    });

                    // Añadir dimensiones para cálculo de peso volumétrico
                    if (length && width && height) {
                        priceParams.append('parcel_length', length.toString());
                        priceParams.append('parcel_width', width.toString());
                        priceParams.append('parcel_height', height.toString());
                        priceParams.append('parcel_height_unit', 'centimeter');
                        priceParams.append('parcel_width_unit', 'centimeter');
                        priceParams.append('parcel_length_unit', 'centimeter');
                    }

                    const priceUrl = `https://panel.sendcloud.sc/api/v2/shipping-price?${priceParams}`;
                    const priceData = await makeRequest(priceUrl, publicKey, secretKey);
                    const priceJson = JSON.parse(priceData);

                    // La respuesta es un array de precios (normalmente uno por país)
                    if (Array.isArray(priceJson) && priceJson.length > 0) {
                        // El precio ya viene calculado para el envío completo
                        method.price = parseFloat(priceJson[0].price);
                        method.currency = priceJson[0].currency;
                    } else {
                        console.warn(`Método ${method.id} (${method.name}): respuesta vacía o inválida`);
                        method.price = 0;
                    }
                } catch (error) {
                    // Log detallado para depuración
                    console.error(`Error obteniendo precio para método ${method.id} (${method.name}):`, error.message);
                    method.price = 0;
                }
                return method;
            }));
        }

        // Procesar en batches de 5 para evitar rate limiting
        const BATCH_SIZE = 5;
        const batches = [];
        for (let i = 0; i < methods.length; i += BATCH_SIZE) {
            batches.push(methods.slice(i, i + BATCH_SIZE));
        }

        console.log(`   Processing ${batches.length} batches of ${BATCH_SIZE} methods each...`);

        const methodsWithPrices = [];
        for (const batch of batches) {
            const batchResults = await processBatch(batch);
            methodsWithPrices.push(...batchResults);
            // Pequeña pausa entre batches para ser amigables con la API
            if (batches.indexOf(batch) < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`   💵 Methods with prices: ${methodsWithPrices.filter(m => m.price > 0).length}/${methodsWithPrices.length}`);

        // Filtrar métodos sin precio (Sendcloud no devuelve precios para todos los servicios)
        const methodsWithValidPrices = methodsWithPrices.filter(m => m.price > 0);
        console.log(`   ✓ Valid prices: ${methodsWithValidPrices.length}`);

        // IMPORTANTE: Sendcloud devuelve AMBOS métodos genéricos (ej: "UPS® Standard")
        // y métodos específicos por peso (ej: "UPS Standard 16-18kg").
        // Los métodos específicos por peso tienen precios más baratos y son los que
        // muestra el panel oficial, así que los priorizamos.

        // Agrupar por carrier + servicio base normalizado
        const methodsByService = {};
        methodsWithValidPrices.forEach(method => {
            // Normalizar nombre: quitar peso, símbolos ®, espacios extra, lowercase
            let normalizedName = method.name
                .replace(/\s+\d+-\d+kg$/i, '')  // Quitar "16-18kg"
                .replace(/®/g, '')               // Quitar ®
                .replace(/\s+/g, ' ')            // Normalizar espacios
                .trim()
                .toLowerCase();

            const key = `${method.carrier}:${normalizedName}`;

            if (!methodsByService[key]) {
                methodsByService[key] = [];
            }
            methodsByService[key].push(method);
        });

        // Para cada grupo, preferir el método con rango de peso explícito
        const dedupedMethods = [];
        Object.values(methodsByService).forEach(group => {
            if (group.length === 1) {
                // Solo hay un método, usarlo
                dedupedMethods.push(group[0]);
            } else {
                // Hay múltiples variantes: preferir el que tiene rango de peso
                const withWeightRange = group.find(m => /\d+-\d+kg/i.test(m.name));
                if (withWeightRange) {
                    // Usar el método específico por peso
                    dedupedMethods.push(withWeightRange);
                } else {
                    // Si ninguno tiene rango, usar el primero
                    dedupedMethods.push(group[0]);
                }
            }
        });

        console.log(`\n🔄 Deduplication: ${methodsWithValidPrices.length} → ${dedupedMethods.length} methods`);
        console.log(`✅ Final results ready\n`);

        return { shipping_products: dedupedMethods };

    } catch (error) {
        console.error('Error en servicio Sendcloud:', error);
        throw error;
    }
}

function makeRequest(url, publicKey, secretKey) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(publicKey + ':' + secretKey).toString('base64'),
                'Content-Type': 'application/json'
            }
        };

        https.get(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data);
                } else {
                    reject(new Error(`Error de API Sendcloud (${res.statusCode}): ${res.statusMessage}`));
                }
            });
        }).on('error', (err) => {
            reject(new Error(`Error de red: ${err.message}`));
        });
    });
}
