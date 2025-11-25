import React, { useState } from 'react';

/**
 * Componente de entrada manual de parámetros
 */
export default function ManualEntry({ onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        fromCountry: 'ES',
        toCountry: 'FR',
        fromPostalCode: '03203',
        toPostalCode: '75001',
        weight: '10',
        length: '30',
        width: '60',
        height: '50'
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        // Construir JSON compatible con el formato esperado
        const shipmentJSON = {
            shipment: "MANUAL_ENTRY",
            shipper: {
                city: "Manual Entry",
                postalCode: formData.fromPostalCode,
                countryCode: formData.fromCountry
            },
            recipient: {
                city: "Manual Entry",
                postalCode: formData.toPostalCode,
                countryCode: formData.toCountry
            },
            packages: [
                {
                    kg: formData.weight,
                    lar: formData.length,
                    anc: formData.width,
                    alt: formData.height
                }
            ]
        };

        onSubmit(shipmentJSON);
    };

    return (
        <div className="card">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Entrada Manual
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Origen */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        País de Origen
                    </label>
                    <input
                        type="text"
                        value={formData.fromCountry}
                        onChange={(e) => handleChange('fromCountry', e.target.value.toUpperCase())}
                        className="input-field"
                        placeholder="ES"
                        maxLength={2}
                    />
                </div>

                {/* Destino */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        País de Destino
                    </label>
                    <input
                        type="text"
                        value={formData.toCountry}
                        onChange={(e) => handleChange('toCountry', e.target.value.toUpperCase())}
                        className="input-field"
                        placeholder="FR"
                        maxLength={2}
                    />
                </div>

                {/* Código Postal Origen */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Código Postal Origen
                    </label>
                    <input
                        type="text"
                        value={formData.fromPostalCode}
                        onChange={(e) => handleChange('fromPostalCode', e.target.value)}
                        className="input-field"
                        placeholder="03203"
                    />
                </div>

                {/* Código Postal Destino */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Código Postal Destino
                    </label>
                    <input
                        type="text"
                        value={formData.toPostalCode}
                        onChange={(e) => handleChange('toPostalCode', e.target.value)}
                        className="input-field"
                        placeholder="75001"
                    />
                </div>

                {/* Peso */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Peso (kg)
                    </label>
                    <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleChange('weight', e.target.value)}
                        className="input-field"
                        placeholder="10"
                        min="0"
                        step="0.1"
                    />
                </div>

                {/* Dimensiones */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Dimensiones (cm)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        <input
                            type="number"
                            value={formData.length}
                            onChange={(e) => handleChange('length', e.target.value)}
                            className="input-field"
                            placeholder="Largo"
                            min="0"
                        />
                        <input
                            type="number"
                            value={formData.width}
                            onChange={(e) => handleChange('width', e.target.value)}
                            className="input-field"
                            placeholder="Ancho"
                            min="0"
                        />
                        <input
                            type="number"
                            value={formData.height}
                            onChange={(e) => handleChange('height', e.target.value)}
                            className="input-field"
                            placeholder="Alto"
                            min="0"
                        />
                    </div>
                </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 mt-8">
                <button onClick={handleSubmit} className="btn-primary flex-1">
                    Cotizar Tarifas
                </button>
                <button onClick={onCancel} className="btn-secondary">
                    Cancelar
                </button>
            </div>
        </div>
    );
}
