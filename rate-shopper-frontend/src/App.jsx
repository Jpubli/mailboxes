import React, { useState } from 'react';
import axios from 'axios';
import UploadZone from './components/UploadZone';
import ManualEntry from './components/ManualEntry';
import ShipmentReview from './components/ShipmentReview';
import ResultsTable from './components/ResultsTable';
import Toast from './components/Toast';

const API_URL = 'http://localhost:3001/api';

function App() {
    const [step, setStep] = useState('upload'); // upload, review, loading, results
    const [entryMode, setEntryMode] = useState('upload'); // upload, manual
    const [shipmentData, setShipmentData] = useState(null);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [latency, setLatency] = useState(0);

    const handleJSONLoaded = (json) => {
        setShipmentData(json);
        setStep('review');
        setError(null);
    };

    const handleConfirmShipment = async () => {
        setStep('loading');
        setError(null);

        try {
            const response = await axios.post(`${API_URL}/get-rates`, shipmentData);

            if (response.data.success) {
                setResults(response.data.results);
                setLatency(response.data.meta.latency);
                setStep('results');
            } else {
                throw new Error(response.data.message || 'Error desconocido');
            }
        } catch (err) {
            console.error('Error al cotizar:', err);
            setError(err.response?.data?.message || err.message || 'Error al conectar con el servidor');
            setStep('review');
        }
    };

    const handleCancelReview = () => {
        setShipmentData(null);
        setStep('upload');
    };

    const handleNewQuote = () => {
        setShipmentData(null);
        setResults(null);
        setError(null);
        setStep('upload');
    };

    const handleCopyAccount = (accountNumber) => {
        navigator.clipboard.writeText(accountNumber);
        setToast({ message: `Nº Cuenta "${accountNumber}" copiado al portapapeles`, type: 'success' });
    };

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                            Rate Shopper
                        </h1>
                    </div>
                    <p className="text-lg text-slate-600">
                        Comparador de Tarifas Logísticas
                    </p>
                    {shipmentData && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-slate-700">
                                    Envío: <span className="font-bold text-primary-600">{shipmentData.shipment}</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Global */}
                {error && (
                    <div className="mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
                        <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <p className="font-semibold text-red-800 text-lg">Error</p>
                            <p className="text-red-600 mt-1">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Step: Upload */}
                {step === 'upload' && (
                    <div className="space-y-4">
                        {/* Mode Toggle */}
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => setEntryMode('upload')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${entryMode === 'upload'
                                        ? 'bg-primary-600 text-white shadow-md'
                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                    }`}
                            >
                                Cargar JSON
                            </button>
                            <button
                                onClick={() => setEntryMode('manual')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${entryMode === 'manual'
                                        ? 'bg-primary-600 text-white shadow-md'
                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                    }`}
                            >
                                Entrada Manual
                            </button>
                        </div>

                        {/* Content based on mode */}
                        {entryMode === 'upload' ? (
                            <UploadZone onJSONLoaded={handleJSONLoaded} />
                        ) : (
                            <ManualEntry
                                onSubmit={handleJSONLoaded}
                                onCancel={() => setEntryMode('upload')}
                            />
                        )}
                    </div>
                )}

                {/* Step: Review */}
                {step === 'review' && (
                    <ShipmentReview
                        shipmentData={shipmentData}
                        onConfirm={handleConfirmShipment}
                        onCancel={handleCancelReview}
                    />
                )}

                {/* Step: Loading */}
                {step === 'loading' && (
                    <div className="card text-center py-16 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 mb-6">
                            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Cotizando tarifas...</h2>
                        <p className="text-slate-600">
                            Consultando todas las cuentas disponibles en Sendcloud
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                )}

                {/* Step: Results */}
                {step === 'results' && results && (
                    <div className="space-y-6">
                        <ResultsTable
                            results={results}
                            onCopyAccount={handleCopyAccount}
                            latency={latency}
                        />
                        <div className="flex justify-center">
                            <button onClick={handleNewQuote} className="btn-primary">
                                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Nueva Cotización
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-16 text-center text-sm text-slate-500">
                    <p>Rate Shopper v1.0 • Powered by Sendcloud API</p>
                    <p className="mt-2">
                        {process.env.NODE_ENV === 'development' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                Modo Mock (PoC)
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

export default App;
