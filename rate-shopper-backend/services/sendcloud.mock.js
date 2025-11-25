/**
 * Mock del servicio Sendcloud
 * Simula respuestas de la API de Sendcloud para PoC sin credenciales reales
 */

/**
 * Simula una llamada al endpoint GET /api/v2/shipping-products
 * @param {Object} params - Parámetros de la consulta
 * @returns {Promise<Object>} Respuesta simulada de Sendcloud
 */
export async function getShippingProducts(params) {
    const { from_country, to_country, from_postal_code, to_postal_code, weight } = params;

    // Simular latencia de red (500-1500ms)
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Datos mock de múltiples contratos
    const mockProducts = [
        // DHL - 3 contratos diferentes
        {
            id: 'dhl_express_1',
            name: 'DHL Express 12:00',
            carrier: 'DHL',
            contract_id: 'V24059',
            price: 45.90,
            currency: 'EUR',
            delivery_time: '1-2',
            service_point_input: 'none'
        },
        {
            id: 'dhl_standard_2',
            name: 'DHL Standard',
            carrier: 'DHL',
            contract_id: 'V24060',
            price: 32.50,
            currency: 'EUR',
            delivery_time: '3-5',
            service_point_input: 'none'
        },
        {
            id: 'dhl_ecommerce_3',
            name: 'DHL eCommerce',
            carrier: 'DHL',
            contract_id: 'V24061',
            price: 28.90,
            currency: 'EUR',
            delivery_time: '4-6',
            service_point_input: 'none'
        },

        // UPS - 2 contratos diferentes
        {
            id: 'ups_saver_1',
            name: 'UPS Saver',
            carrier: 'UPS',
            contract_id: 'U12345',
            price: 42.00,
            currency: 'EUR',
            delivery_time: '2-3',
            service_point_input: 'none'
        },
        {
            id: 'ups_standard_2',
            name: 'UPS Standard',
            carrier: 'UPS',
            contract_id: 'U12346',
            price: 36.75,
            currency: 'EUR',
            delivery_time: '3-4',
            service_point_input: 'none'
        },

        // FedEx - 1 contrato
        {
            id: 'fedex_priority_1',
            name: 'FedEx Priority',
            carrier: 'FedEx',
            contract_id: 'F99999',
            price: 48.50,
            currency: 'EUR',
            delivery_time: '1-2',
            service_point_input: 'none'
        },

        // Correos Express - 2 contratos
        {
            id: 'correos_express_1',
            name: 'Correos Express 24H',
            carrier: 'Correos Express',
            contract_id: 'C88001',
            price: 25.90,
            currency: 'EUR',
            delivery_time: '1',
            service_point_input: 'none'
        },
        {
            id: 'correos_standard_2',
            name: 'Correos Standard',
            carrier: 'Correos Express',
            contract_id: 'C88002',
            price: 18.50,
            currency: 'EUR',
            delivery_time: '2-3',
            service_point_input: 'none'
        }
    ];

    // Ajustar precios basados en el peso (simulación realista)
    const adjustedProducts = mockProducts.map(product => ({
        ...product,
        price: parseFloat((product.price * (1 + (weight - 10) * 0.05)).toFixed(2))
    }));

    // Simular estructura de respuesta de Sendcloud
    return {
        shipping_products: adjustedProducts,
        meta: {
            from_country,
            to_country,
            from_postal_code,
            to_postal_code,
            weight,
            weight_unit: 'kilograms'
        }
    };
}

/**
 * Simula errores de la API según los códigos postales
 * Útil para testing de manejo de errores
 */
export function shouldSimulateError(from_postal_code, to_postal_code) {
    // Simular error si el código postal destino es "00000"
    if (to_postal_code === '00000') {
        return {
            error: true,
            message: 'Código postal de destino no válido',
            status: 400
        };
    }

    return { error: false };
}
