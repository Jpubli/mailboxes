import React, { useState } from 'react';

/**
 * Componente de carga de JSON
 * Permite Drag & Drop y pegado de texto
 */
export default function UploadZone({ onJSONLoaded }) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [pasteMode, setPasteMode] = useState(false);
    const [jsonText, setJsonText] = useState('');

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        const file = e.dataTransfer.files[0];
        if (!file) {
            setError('No se detectó ningún archivo');
            return;
        }

        if (!file.name.endsWith('.json')) {
            setError('El archivo debe ser formato .json');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                onJSONLoaded(json);
            } catch (err) {
                setError('El archivo no contiene JSON válido');
            }
        };
        reader.readAsText(file);
    };

    const handlePaste = () => {
        setError(null);
        try {
            const json = JSON.parse(jsonText);
            onJSONLoaded(json);
            setJsonText('');
            setPasteMode(false);
        } catch (err) {
            setError('El texto no es JSON válido');
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                onJSONLoaded(json);
            } catch (err) {
                setError('El archivo no contiene JSON válido');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="card">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Cargar Expedición
            </h2>

            {!pasteMode ? (
                <>
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${isDragging
                                ? 'border-primary-500 bg-primary-50 scale-[1.02]'
                                : 'border-slate-300 bg-slate-50 hover:border-primary-400'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isDragging ? 'bg-primary-500 scale-110' : 'bg-slate-200'
                                }`}>
                                <svg
                                    className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-slate-500'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-slate-700">
                                    Arrastra tu archivo JSON aquí
                                </p>
                                <p className="text-sm text-slate-500 mt-1">
                                    o haz clic para seleccionar
                                </p>
                            </div>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleFileInput}
                                className="hidden"
                                id="fileInput"
                            />
                            <label htmlFor="fileInput" className="btn-primary cursor-pointer">
                                Seleccionar Archivo
                            </label>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setPasteMode(true)}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm underline"
                        >
                            ¿Prefieres pegar el JSON como texto?
                        </button>
                    </div>
                </>
            ) : (
                <div className="space-y-4">
                    <textarea
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        placeholder='{"shipment": "1000081", "shipper": {...}, ...}'
                        className="input-field font-mono text-sm min-h-[200px]"
                    />
                    <div className="flex gap-3">
                        <button onClick={handlePaste} className="btn-primary flex-1">
                            Procesar JSON
                        </button>
                        <button
                            onClick={() => {
                                setPasteMode(false);
                                setJsonText('');
                                setError(null);
                            }}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3 animate-fade-in">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <p className="font-semibold text-red-800">Error de validación</p>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
