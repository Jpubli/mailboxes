import React, { useState } from 'react';

/**
 * Componente de tabla de resultados con ordenación y copy-to-clipboard
 */
export default function ResultsTable({ results, onCopyAccount, latency }) {
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    if (!results || results.length === 0) {
        return null;
    }

    // Encontrar el más barato y más rápido
    const cheapest = results.reduce((min, r) => r.price < min.price ? r : min, results[0]);
    const fastest = results.reduce((min, r) => {
        const time1 = parseInt(r.deliveryTime?.split('-')[0] || '999');
        const time2 = parseInt(min.deliveryTime?.split('-')[0] || '999');
        return time1 < time2 ? r : min;
    }, results[0]);

    // Ordenar resultados
    let sortedResults = [...results];
    if (sortBy === 'price') {
        sortedResults.sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
    } else if (sortBy === 'time') {
        sortedResults.sort((a, b) => {
            const timeA = parseInt(a.deliveryTime?.split('-')[0] || '999');
            const timeB = parseInt(b.deliveryTime?.split('-')[0] || '999');
            return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });
    }

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const SortIcon = ({ column }) => {
        if (sortBy !== column) {
            return (
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        return sortOrder === 'asc' ? (
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    return (
        <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-7 h-7 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Resultados de Cotización
                    </h2>
                    <p className="text-slate-600 mt-1">{results.length} opciones encontradas en {latency}ms</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-success-50 rounded-lg border border-success-200">
                        <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                        <span className="text-sm font-medium text-success-700">Resaltado: Mejor opción</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="text-left py-4 px-4 font-semibold text-slate-700">Transportista</th>
                            <th className="text-left py-4 px-4 font-semibold text-slate-700">Servicio</th>
                            <th className="text-left py-4 px-4 font-semibold text-slate-700">
                                <button
                                    onClick={() => handleSort('price')}
                                    className="flex items-center gap-2 hover:text-primary-600 transition-colors"
                                >
                                    Nº Cuenta (ERP)
                                </button>
                            </th>
                            <th className="text-left py-4 px-4 font-semibold text-slate-700">
                                <button
                                    onClick={() => handleSort('time')}
                                    className="flex items-center gap-2 hover:text-primary-600 transition-colors"
                                >
                                    Tiempo Tránsito
                                    <SortIcon column="time" />
                                </button>
                            </th>
                            <th className="text-left py-4 px-4 font-semibold text-slate-700">
                                <button
                                    onClick={() => handleSort('price')}
                                    className="flex items-center gap-2 hover:text-primary-600 transition-colors"
                                >
                                    Coste
                                    <SortIcon column="price" />
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedResults.map((result, index) => {
                            const isCheapest = result.id === cheapest.id;
                            const isFastest = result.id === fastest.id;
                            const isHighlighted = isCheapest || isFastest;

                            return (
                                <tr
                                    key={result.id}
                                    className={`border-b border-slate-100 transition-all hover:bg-slate-50 ${isHighlighted ? 'bg-success-50/50 hover:bg-success-50' : ''
                                        }`}
                                >
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center font-bold text-primary-700 text-sm">
                                                {result.carrier.substring(0, 3).toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-slate-800">{result.carrier}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-slate-700">{result.service}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <button
                                            onClick={() => onCopyAccount(result.accountNumber)}
                                            className="px-3 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-700 font-mono font-semibold rounded-md transition-colors flex items-center gap-2 group"
                                            title="Click para copiar"
                                        >
                                            {result.accountNumber}
                                            <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-slate-600">
                                            {result.deliveryTime ? `${result.deliveryTime} días` : 'N/D'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-slate-800">
                                                {result.price.toFixed(2)}€
                                            </span>
                                            {isCheapest && (
                                                <span className="badge badge-success text-xs">Más barato</span>
                                            )}
                                            {isFastest && !isCheapest && (
                                                <span className="badge badge-info text-xs">Más rápido</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
