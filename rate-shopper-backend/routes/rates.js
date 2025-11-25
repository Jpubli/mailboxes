/**
 * Router para el endpoint /api/get-rates
 * Procesa solicitudes de cotización y consulta Sendcloud
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { validateShipmentJSON, calculateTotalWeight } from '../utils/validator.js';

// Importar servicio según configuración
const useMock = process.env.USE_MOCK === 'true';
let sendcloudService;

if (useMock) {
    const mockModule = await import('../services/sendcloud.mock.js');
    sendcloudService = {
        getShippingProducts: mockModule.getShippingProducts,
        shouldSimulateError: mockModule.shouldSimulateError
    };
    console.log('🔧 Usando servicio MOCK de Sendcloud');
} else {
    const realModule = await import('../services/sendcloud.real.js');
    sendcloudService = {
        getShippingProducts: realModule.getShippingProducts,
        shouldSimulateError: () => ({ error: false }) // No simular errores en producción
    };
    console.log('🚀 Usando servicio REAL de Sendcloud');
}

const router = express.Router();

/**
 * POST /api/get-rates
 * Recibe JSON de expedición y devuelve tarifas de todos los contratos
 */
// POST /api/get-rates - Obtener tarifas de envío
router.post('/get-rates', async (req, res) => {
    console.log('\n========================================');
    console.log('📥 Nueva petición de cotización');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Body keys:', Object.keys(req.body));
    const startTime = Date.now();

    try {
        console.log('DEBUG - Incoming Request Body:', JSON.stringify(req.body, null, 2));
        const shipmentData = req.body;

        // Registrar la petición
        console.log(`[${new Date().toISOString()}] Cotización solicitada para envío: ${shipmentData.shipment || 'N/A'}`);

        // Validar JSON
        const validation = validateShipmentJSON(shipmentData);
        if (!validation.valid) {
            return res.status(400).json({
                error: true,
                message: 'Datos de envío inválidos',
                details: validation.errors
            });
        }

        // Verificar si debemos simular un error (solo en mock)
        const errorCheck = sendcloudService.shouldSimulateError(
            shipmentData.shipper.postalCode,
            shipmentData.recipient.postalCode
        );

        if (errorCheck.error) {
            return res.status(errorCheck.status).json({
                error: true,
                message: errorCheck.message
            });
        }

        // Calcular peso total y estadísticas de paquetes
        let totalWeight = 0;
        let maxPackageWeight = 0;
        let packageCount = 1;
        let maxLength = 0;
        let maxWidth = 0;
        let maxHeight = 0;

        if (shipmentData.packages && Array.isArray(shipmentData.packages) && shipmentData.packages.length > 0) {
            packageCount = shipmentData.packages.length;
            shipmentData.packages.forEach(pkg => {
                const pkgWeight = parseFloat(pkg.kg) || 0;
                totalWeight += pkgWeight;
                if (pkgWeight > maxPackageWeight) maxPackageWeight = pkgWeight;

                // Extraer dimensiones del paquete más grande
                const length = parseFloat(pkg.lar) || 0;
                const width = parseFloat(pkg.anc) || 0;
                const height = parseFloat(pkg.alt) || 0;
                if (length > maxLength) maxLength = length;
                if (width > maxWidth) maxWidth = width;
                if (height > maxHeight) maxHeight = height;
            });
        } else {
            totalWeight = parseFloat(shipmentData.weight) || 1;
            maxPackageWeight = totalWeight;
        }

        // NOTA: El peso volumétrico NO se aplica automáticamente en las consultas
        // de precios de Sendcloud. El panel oficial solo usa el peso real.
        // El peso volumétrico solo se aplica cuando se crea un envío real.

        // Calcular peso volumétrico (L×W×H / 5000 para cm³ a kg) - DESACTIVADO
        // let volumetricWeight = 0;
        // if (maxLength > 0 && maxWidth > 0 && maxHeight > 0) {
        //     volumetricWeight = (maxLength * maxWidth * maxHeight) / 5000;
        //     console.log(`Peso real: ${totalWeight}kg, Peso volumétrico: ${volumetricWeight.toFixed(2)}kg`);
        // }

        // Usar solo el peso real (NO volumétrico) para coincidir con panel Sendcloud
        const effectiveWeight = totalWeight;

        // Preparar parámetros para Sendcloud (usando peso real para pricing correcto)
        const sendcloudParams = {
            from_country: shipmentData.shipper?.countryCode || 'ES',
            to_country: shipmentData.recipient?.countryCode || 'ES',
            from_postal_code: shipmentData.shipper?.postalCode || '',
            to_postal_code: shipmentData.recipient?.postalCode || '',
            weight: effectiveWeight, // Peso real (NO volumétrico)
            max_package_weight: maxPackageWeight,
            package_count: packageCount,
            weight_unit: 'kilograms',
            // Dimensiones para referencia
            length: maxLength,
            width: maxWidth,
            height: maxHeight
        };

        console.log('\n🔍 Parámetros calculados:');
        console.log('  - Peso total:', totalWeight, 'kg');
        console.log('  - Peso máx paquete:', maxPackageWeight, 'kg');
        console.log('  - Número de paquetes:', packageCount);
        console.log('  - Dimensiones:', maxLength, 'x', maxWidth, 'x', maxHeight, 'cm');
        console.log('  - Origen:', sendcloudParams.from_country, sendcloudParams.from_postal_code);
        console.log('  - Destino:', sendcloudParams.to_country, sendcloudParams.to_postal_code);

        // Llamar al servicio correspondiente
        console.log('\n🚀 Llamando a Sendcloud API...');
        console.log(`Modo: ${useMock ? 'MOCK' : 'REAL API'}`);
        const apiCallStartTime = Date.now();
        const sendcloudResponse = await sendcloudService.getShippingProducts(sendcloudParams);
        const apiLatency = Date.now() - apiCallStartTime;
        console.log(`✅ Respuesta recibida en ${apiLatency}ms`);
        console.log(`📦 Métodos encontrados: ${sendcloudResponse.shipping_products?.length || 0}`);
        // Procesar y formatear respuesta
        const results = sendcloudResponse.shipping_products.map(product => {
            // Manejar estructura de respuesta real vs mock
            const accountNumber = product.contract_id || product.id || 'N/A';
            const price = product.price ? parseFloat(product.price) : 0;

            // Intentar obtener tiempo de entrega de lead_time_hours si existe
            let deliveryTime = product.delivery_time || 'N/D';
            if (!product.delivery_time && product.lead_time_hours && typeof product.lead_time_hours === 'object') {
                // Simplificación: tomar el primer valor encontrado
                // En producción se debería buscar por país origen/destino
                deliveryTime = '2-3'; // Valor por defecto estimado
            }

            return {
                id: product.id ? product.id.toString() : Math.random().toString(),
                carrier: product.carrier,
                service: product.name,
                accountNumber: accountNumber.toString(),
                deliveryTime: deliveryTime,
                price: price,
                currency: product.currency || 'EUR'
            };
        });

        // Calcular latencia
        const latency = Date.now() - startTime;
        console.log(`Cotización completada en ${latency}ms - ${results.length} opciones encontradas`);

        // Devolver resultados
        res.json({
            success: true,
            shipmentId: shipmentData.shipment,
            origin: {
                country: shipmentData.shipper.countryCode,
                postalCode: shipmentData.shipper.postalCode
            },
            destination: {
                country: shipmentData.recipient.countryCode,
                postalCode: shipmentData.recipient.postalCode
            },
            weight: totalWeight,
            packages: shipmentData.packages.length,
            results,
            meta: {
                latency,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error procesando cotización:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            error: true,
            message: error.message || 'Error interno del servidor',
            details: error.message
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mode: process.env.USE_MOCK === 'true' ? 'mock' : 'production'
    });
});

export default router;
