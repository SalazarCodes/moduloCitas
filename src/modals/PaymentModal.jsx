import React, { useState } from 'react';
import { X, CreditCard, Banknote } from 'lucide-react';
import { TRATAMIENTOS } from '../constants/salonData';

export default function PaymentModal({ citasCliente, onClose, onConfirmPayment }) {
    // Construimos la info de cada tratamiento a partir de las citas
    const tratamientos = citasCliente.map(cita => {
        const trat = TRATAMIENTOS.find(t => t.id === parseInt(cita.tratamientoId));
        return {
            citaId: cita.id,
            nombre: trat ? trat.nombre : 'Servicio general',
            categoria: trat ? trat.categoria : 'General'
        };
    });

    // Estado de precios: un valor por cada cita
    const [precios, setPrecios] = useState(() => {
        const inicial = {};
        citasCliente.forEach(cita => {
            inicial[cita.id] = '';
        });
        return inicial;
    });

    const [metodoPago, setMetodoPago] = useState('Yape');

    // Calcular subtotal sumando todos los precios ingresados
    const subtotal = Object.values(precios).reduce((suma, p) => suma + (parseFloat(p) || 0), 0);

    const actualizarPrecio = (citaId, valor) => {
        setPrecios(prev => ({ ...prev, [citaId]: valor }));
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
                monto: parseFloat(precios[t.citaId])
            }))
        };

        onConfirmPayment(datosPago);
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
                                key={trat.citaId}
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
                                            value={precios[trat.citaId]}
                                            onChange={(e) => actualizarPrecio(trat.citaId, e.target.value)}
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
                            <option value="Transferencia">Transferencia Bancaria</option>
                        </select>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer" style={{ marginTop: '0' }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancelar
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


