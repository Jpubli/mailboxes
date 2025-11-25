/**
 * Rate Shopper Backend Server
 * Servidor Express para la WebApp de comparación de tarifas logísticas
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ratesRouter from './routes/rates.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api', ratesRouter);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Rate Shopper API',
        version: '1.0.0',
        description: 'API para comparación de tarifas logísticas con Sendcloud',
        mode: process.env.USE_MOCK === 'true' ? 'Mock (PoC)' : 'Production',
        endpoints: {
            health: '/api/health',
            rates: 'POST /api/get-rates'
        }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        error: true,
        message: 'Error interno del servidor'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: true,
        message: 'Endpoint no encontrado'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║     RATE SHOPPER BACKEND SERVER              ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📦 Modo: ${process.env.USE_MOCK === 'true' ? 'MOCK (PoC)' : 'PRODUCTION'}`);
    console.log(`⏰ Iniciado: ${new Date().toLocaleString('es-ES')}`);
    console.log('');
    console.log('Endpoints disponibles:');
    console.log(`  GET  http://localhost:${PORT}/`);
    console.log(`  GET  http://localhost:${PORT}/api/health`);
    console.log(`  POST http://localhost:${PORT}/api/get-rates`);
    console.log('');
    console.log('Presiona Ctrl+C para detener el servidor');
    console.log('═══════════════════════════════════════════════');
});
