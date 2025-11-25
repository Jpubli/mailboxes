import React from 'react';

/**
 * Componente panel de revisión de datos de expedición
 * Muestra los datos extraídos del JSON antes de cotizar
 */
export default function ShipmentReview({ shipmentData, onConfirm, onCancel }) {
    const totalPackages = shipmentData.packages ? shipmentData.packages.length : 0;
    const totalWeight = shipmentData.packages
        ? shipmentData.packages.reduce((sum, pkg) => sum + parseFloat(pkg.kg || 0), 0).toFixed(2)
        : 0;

    return (
        <div className="card animate-fade-in">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Revisión de Expedición
                    </h2>
                    <p className="text-slate-600 mt-1">Confirma los datos antes de cotizar</p>
                </div>
                <span className="badge badge-info">
                    ID: {shipmentData.shipment}
                </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Origen */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-2 border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Origen (Remitente)
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-blue-700">País:</span>
                            <span className="font-semibold text-blue-900">{shipmentData.shipper?.countryCode || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-blue-700">Código Postal:</span>
                            <span className="font-semibold text-blue-900">{shipmentData.shipper?.postalCode || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Destino */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-2 border-green-200">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Destino (Destinatario)
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-green-700">País:</span>
                            <span className="font-semibold text-green-900">{shipmentData.recipient?.countryCode || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-green-700">Código Postal:</span>
                            <span className="font-semibold text-green-900">{shipmentData.recipient?.postalCode || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Paquetes */}
            <div className="bg-slate-50 p-5 rounded-lg border-2 border-slate-200 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Información Logística
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-primary-600">{totalPackages}</p>
                        <p className="text-xs text-slate-600 mt-1">Bultos</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-primary-600">{totalWeight}</p>
                        <p className="text-xs text-slate-600 mt-1">Kg Total</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg col-span-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Ruta</p>
                        <p className="text-sm font-semibold text-slate-800">
                            {shipmentData.shipper?.countryCode} → {shipmentData.recipient?.countryCode}
                        </p>
                    </div>
                </div>

                {/* Lista de paquetes */}
                <div className="max-h-48 overflow-y-auto space-y-2">
                    {shipmentData.packages && shipmentData.packages.map((pkg, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg flex items-center justify-between text-sm border border-slate-200">
                            <span className="font-medium text-slate-700">Bulto {index + 1}</span>
                            <span className="text-slate-600">
                                {pkg.kg} kg • {pkg.lar}×{pkg.anc}×{pkg.alt} cm
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4">
                <button onClick={onConfirm} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Cotizar Tarifas
                </button>
                <button onClick={onCancel} className="btn-secondary">
                    Cancelar
                </button>
            </div>
        </div>
    );
}
