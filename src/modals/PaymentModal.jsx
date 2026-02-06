import React, { useState } from 'react';
import { X, CreditCard, Banknote, FileText, Save } from 'lucide-react';
import { TRATAMIENTOS } from '../constants/salonData';

export default function PaymentModal({ citasCliente, onClose, onConfirmPayment }) {
    // Construimos la info de cada tratamiento a partir de las citas
    // Si una cita tiene tratamientos array, expandir cada sub-tratamiento como línea individual
    const tratamientos = citasCliente.flatMap(cita => {
        if (cita.tratamientos && cita.tratamientos.length > 1) {
            return cita.tratamientos.map((sub, index) => {
                const trat = TRATAMIENTOS.find(t => t.id === sub.tratamientoId);
                return {
                    citaId: cita.id,
                    key: `${cita.id}_${index}`,
                    nombre: trat ? trat.nombre : 'Servicio general',
                    categoria: trat ? trat.categoria : 'General'
                };
            });
        }
        const trat = TRATAMIENTOS.find(t => t.id === parseInt(cita.tratamientoId));
        return [{
            citaId: cita.id,
            key: `${cita.id}_0`,
            nombre: trat ? trat.nombre : 'Servicio general',
            categoria: trat ? trat.categoria : 'General'
        }];
    });

    // Clave única para localStorage basada en los IDs de las citas
    const storageKey = `cobro_pendiente_${citasCliente.map(c => c.id).sort().join('_')}`;

    // Estado de precios: cargar de localStorage si existe, sino inicializar vacío
    const [precios, setPrecios] = useState(() => {
        const guardado = localStorage.getItem(storageKey);
        if (guardado) {
            try {
                const parsed = JSON.parse(guardado);
                // Verificar que las keys coincidan
                const keysGuardadas = Object.keys(parsed.precios || {});
                const keysActuales = tratamientos.map(t => t.key);
                if (keysActuales.every(k => keysGuardadas.includes(k))) {
                    return parsed.precios;
                }
            } catch (e) {
                console.error('Error cargando precios guardados:', e);
            }
        }
        const inicial = {};
        tratamientos.forEach(t => {
            inicial[t.key] = '';
        });
        return inicial;
    });

    const [metodoPago, setMetodoPago] = useState(() => {
        const guardado = localStorage.getItem(storageKey);
        if (guardado) {
            try {
                const parsed = JSON.parse(guardado);
                return parsed.metodoPago || 'Yape';
            } catch (e) {
                return 'Yape';
            }
        }
        return 'Yape';
    });

    const [guardadoExitoso, setGuardadoExitoso] = useState(false);

    // Calcular subtotal sumando todos los precios ingresados
    const subtotal = Object.values(precios).reduce((suma, p) => suma + (parseFloat(p) || 0), 0);

    const actualizarPrecio = (key, valor) => {
        setPrecios(prev => ({ ...prev, [key]: valor }));
        setGuardadoExitoso(false); // Resetear indicador al modificar
    };

    // Guardar precios para después
    const guardarParaDespues = () => {
        const datos = {
            precios,
            metodoPago,
            fechaGuardado: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(datos));
        setGuardadoExitoso(true);
        setTimeout(() => setGuardadoExitoso(false), 2000);
    };

    // Limpiar precios guardados
    const limpiarPreciosGuardados = () => {
        localStorage.removeItem(storageKey);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar que todos los precios estén llenos
        const algunPrecioVacio = Object.values(precios).some(p => !p || isNaN(p));
        if (algunPrecioVacio) {
            alert('Por favor ingrese todos los precios');
            return;
        }

        const datosPago = {
            citaIds: citasCliente.map(c => c.id),
            montoTotal: subtotal,
            metodo: metodoPago,
            fecha: new Date().toISOString(),
            items: tratamientos.map(t => ({
                citaId: t.citaId,
                servicio: t.nombre,
                categoria: t.categoria,
                monto: parseFloat(precios[t.key])
            }))
        };

        // Limpiar precios guardados al confirmar pago
        limpiarPreciosGuardados();
        onConfirmPayment(datosPago);
    };

    // Generar boleta en nueva ventana (formato papel térmico 58mm)
    const generarBoleta = () => {
        const fechaHoy = new Date().toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const itemsHTML = tratamientos.map(t => {
            const precio = parseFloat(precios[t.key]) || 0;
            return `
                <div class="item">
                    <div class="item-categoria">${t.categoria}</div>
                    <div class="item-nombre">${t.nombre}</div>
                    <div class="item-precio">S/. ${precio.toFixed(2)}</div>
                </div>
            `;
        }).join('');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Nota de Venta - MUSA</title>
                <style>
                    @page {
                        size: 58mm auto;
                        margin: 0;
                    }
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 10px;
                        width: 58mm;
                        padding: 3mm;
                        background: white;
                        color: #000;
                        font-weight: 500;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 8px;
                        margin-bottom: 8px;
                    }
                    .logo {
                        font-size: 18px;
                        font-weight: 900;
                        letter-spacing: 3px;
                    }
                    .subtitle {
                        font-size: 9px;
                        margin-top: 4px;
                        color: #000;
                        font-weight: 500;
                    }
                    .nota-tipo {
                        font-size: 11px;
                        font-weight: 700;
                        margin-top: 6px;
                        padding: 3px;
                        border: 1px solid #000;
                        display: inline-block;
                    }
                    .fecha {
                        font-size: 9px;
                        margin-top: 6px;
                        color: #000;
                        font-weight: 500;
                    }
                    .items {
                        margin: 10px 0;
                    }
                    .item {
                        margin-bottom: 8px;
                        padding-bottom: 6px;
                        border-bottom: 1px dotted #000;
                    }
                    .item:last-child {
                        border-bottom: none;
                    }
                    .item-categoria {
                        font-size: 8px;
                        text-transform: uppercase;
                        color: #000;
                        letter-spacing: 0.5px;
                        font-weight: 500;
                    }
                    .item-nombre {
                        font-size: 10px;
                        font-weight: 700;
                        margin: 2px 0;
                    }
                    .item-precio {
                        font-size: 10px;
                        text-align: right;
                        font-weight: 600;
                    }
                    .total-section {
                        border-top: 1px dashed #000;
                        padding-top: 8px;
                        margin-top: 8px;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 12px;
                        font-weight: 900;
                    }
                    .metodo-pago {
                        font-size: 9px;
                        text-align: right;
                        margin-top: 4px;
                        color: #000;
                        font-weight: 500;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 12px;
                        padding-top: 8px;
                        border-top: 1px dashed #000;
                        font-size: 9px;
                        color: #000;
                        font-weight: 500;
                    }
                    .no-valor {
                        font-size: 8px;
                        margin-top: 6px;
                        color: #000;
                        font-weight: 400;
                    }
                    @media print {
                        body {
                            width: 58mm;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                    .btn-imprimir {
                        display: block;
                        width: 100%;
                        margin-top: 15px;
                        padding: 8px;
                        background: #2563eb;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 10px;
                    }
                    .btn-imprimir:hover {
                        background: #1d4ed8;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">MUSA</div>
                    <div class="subtitle">Centro de Belleza</div>
                    <div class="nota-tipo">NOTA DE VENTA</div>
                    <div class="fecha">${fechaHoy}</div>
                </div>

                <div class="items">
                    ${itemsHTML}
                </div>

                <div class="total-section">
                    <div class="total-row">
                        <span>TOTAL:</span>
                        <span>S/. ${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="metodo-pago">
                        Método de pago: ${metodoPago}
                    </div>
                </div>

                <div class="footer">
                    <div>Gracias por su preferencia</div>
                    <div class="no-valor">DOCUMENTO SIN VALOR FISCAL</div>
                </div>

                <button class="btn-imprimir no-print" onclick="window.print()">
                    Imprimir
                </button>
            </body>
            </html>
        `;

        const ventana = window.open('', '_blank', 'width=250,height=400');
        ventana.document.write(html);
        ventana.document.close();
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>Registrar Cobro</h2>
                    <button onClick={onClose} className="modal-close">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {/* Lista de tratamientos */}
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px', color: '#475569' }}>
                            Detalle de Servicios
                        </h3>

                        {tratamientos.map((trat, index) => (
                            <div
                                key={trat.key}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px 0',
                                    borderBottom: index < tratamientos.length - 1 ? '1px solid #e2e8f0' : 'none'
                                }}
                            >
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                                        {trat.categoria}
                                    </span>
                                    <span style={{ fontWeight: '500', color: '#1e293b' }}>
                                        {trat.nombre}
                                    </span>
                                </div>
                                <div style={{ width: '120px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ marginRight: '5px', color: '#64748b', fontSize: '0.875rem' }}>S/.</span>
                                        <input
                                            type="number"
                                            value={precios[trat.key]}
                                            onChange={(e) => actualizarPrecio(trat.key, e.target.value)}
                                            className="form-control"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.10"
                                            autoFocus={index === 0}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '6px 8px',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '4px',
                                                fontSize: '0.875rem'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Subtotal */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: '2px solid #cbd5e1'
                        }}>
                            <span style={{ fontWeight: '600', color: '#334155', fontSize: '1rem' }}>
                                Subtotal
                            </span>
                            <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.25rem' }}>
                                S/. {subtotal.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Método de pago */}
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CreditCard size={18} /> Método de Pago
                        </label>
                        <select
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        >
                            <option value="Yape">Yape</option>
                            <option value="Plin">Plin</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                            <option value="QR Musa">QR Musa</option>
                        </select>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer" style={{ marginTop: '0', flexWrap: 'wrap', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={generarBoleta}
                            className="btn"
                            style={{ backgroundColor: '#6366f1', color: 'white' }}
                        >
                            <FileText size={18} style={{ marginRight: '5px' }} />
                            Boleta
                        </button>
                        <button
                            type="button"
                            onClick={guardarParaDespues}
                            className="btn"
                            style={{
                                backgroundColor: guardadoExitoso ? '#16a34a' : '#f59e0b',
                                color: 'white',
                                transition: 'background-color 0.3s'
                            }}
                        >
                            <Save size={18} style={{ marginRight: '5px' }} />
                            {guardadoExitoso ? 'Guardado!' : 'Guardar'}
                        </button>
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cerrar
                        </button>
                        <button type="submit" className="btn btn-success" style={{ backgroundColor: '#10b981', color: 'white' }}>
                            <Banknote size={18} style={{ marginRight: '5px' }} />
                            Pagar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


