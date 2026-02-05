import React, { useState, useMemo } from 'react';
import { X, Plus, Banknote, Trash2 } from 'lucide-react';
import { ESTILISTAS, TRATAMIENTOS, HORARIO_INICIO } from '../constants/salonData';
import PaymentModal from './PaymentModal';

export default function AppointmentModal({ appointment, appointments, onClose, onSave, onDelete, onCancelar, onPagar, clients, onAddClient }) {
    const categoriasDisponibles = [...new Set(TRATAMIENTOS.map(t => t.categoria))];

    // Generar slots de 15 minutos dentro del horario del salón (hasta 20:30)
    const slotsHorarios = useMemo(() => {
        const slots = [];
        const HORA_ULTIMO_SLOT = 20;
        const MINUTO_ULTIMO_SLOT = 30;

        for (let h = HORARIO_INICIO; h <= HORA_ULTIMO_SLOT; h++) {
            for (let m = 0; m < 60; m += 15) {
                // Detenerse después de 20:30
                if (h === HORA_ULTIMO_SLOT && m > MINUTO_ULTIMO_SLOT) break;

                const hStr = h.toString().padStart(2, '0');
                const mStr = m.toString().padStart(2, '0');
                slots.push(`${hStr}:${mStr}`);
            }
        }
        return slots;
    }, []);

    // Separar fecha y hora del appointment existente
    const extraerFechaHora = (fechaISO) => {
        const d = new Date(fechaISO);
        const yyyy = d.getFullYear();
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');
        const hh = d.getHours().toString().padStart(2, '0');
        const min = d.getMinutes().toString().padStart(2, '0');
        return { soloFecha: `${yyyy}-${mm}-${dd}`, soloHora: `${hh}:${min}` };
    };

    const initFechaHora = appointment
        ? extraerFechaHora(appointment.fecha)
        : { soloFecha: new Date().toISOString().split('T')[0], soloHora: `${HORARIO_INICIO.toString().padStart(2, '0')}:00` };

    const [formData, setFormData] = useState(appointment ? {
        ...appointment,
        // Limpiar selectores en edición (tratamientos ya están en la lista)
        estilistaId: '',
        tratamientoId: '',
        categoriaSeleccionada: '',
        soloFecha: initFechaHora.soloFecha,
        soloHora: initFechaHora.soloHora,
    } : {
        clienteId: '',
        estilistaId: '',
        tratamientoId: '',
        categoriaSeleccionada: '',
        soloFecha: initFechaHora.soloFecha,
        soloHora: initFechaHora.soloHora,
        notas: ''
    });

    const [showNewClient, setShowNewClient] = useState(false);
    const [newClient, setNewClient] = useState({ nombre: '', telefono: '', email: '' });
    const [showPayment, setShowPayment] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const selectedClient = formData.clienteId ? clients.find(c => c.id === parseInt(formData.clienteId)) : null;

    // NUEVO: estado para multi-tratamiento
    // En edición, inicializar con los tratamientos existentes
    const [tratamientosAgregados, setTratamientosAgregados] = useState(() => {
        if (appointment?.tratamientos && appointment.tratamientos.length > 0) {
            return appointment.tratamientos.map(t => {
                const trat = TRATAMIENTOS.find(tr => tr.id === t.tratamientoId);
                const est = ESTILISTAS.find(e => e.id === t.estilistaId);
                return {
                    tratamientoId: t.tratamientoId,
                    estilistaId: t.estilistaId,
                    nombre: trat?.nombre || 'Servicio',
                    estilistaNombre: est?.nombre || 'Sin asignar',
                    estilistaColor: est?.color || '#6b7280',
                    duracion: trat?.duracion || 0,
                };
            });
        }
        // Si es edición de cita simple (sin array tratamientos), cargar el tratamiento único
        if (appointment?.tratamientoId) {
            const trat = TRATAMIENTOS.find(tr => tr.id === appointment.tratamientoId);
            const est = ESTILISTAS.find(e => e.id === appointment.estilistaId);
            return [{
                tratamientoId: appointment.tratamientoId,
                estilistaId: appointment.estilistaId,
                nombre: trat?.nombre || 'Servicio',
                estilistaNombre: est?.nombre || 'Sin asignar',
                estilistaColor: est?.color || '#6b7280',
                duracion: trat?.duracion || 0,
            }];
        }
        return [];
    });

    // Determinar si estamos en modo edición (cita ya creada)
    const esEdicion = !!appointment;

    // Buscar citas no pagadas del mismo cliente en el mismo día
    const obtenerCitasClienteMismoDia = () => {
        if (!appointment || !appointments) return [];

        const fechaCitaActual = new Date(appointment.fecha).toDateString();
        const clienteIdActual = parseInt(appointment.clienteId);

        return appointments.filter(c => {
            if (c.pagado || c.cancelado) return false;
            if (parseInt(c.clienteId) !== clienteIdActual) return false;
            const fechaCita = new Date(c.fecha).toDateString();
            return fechaCita === fechaCitaActual;
        });
    };

    // Agregar el tratamiento actual a la lista
    const handleAgregarTratamiento = () => {
        if (!formData.estilistaId || !formData.tratamientoId) {
            alert('Selecciona estilista y tratamiento antes de agregar');
            return;
        }

        const tratamiento = TRATAMIENTOS.find(t => t.id === parseInt(formData.tratamientoId));
        const estilista = ESTILISTAS.find(e => e.id === parseInt(formData.estilistaId));

        setTratamientosAgregados(prev => [
            ...prev,
            {
                tratamientoId: parseInt(formData.tratamientoId),
                estilistaId: parseInt(formData.estilistaId),
                nombre: tratamiento.nombre,
                estilistaNombre: estilista.nombre,
                estilistaColor: estilista.color,
                duracion: tratamiento.duracion,
            }
        ]);

        // Resetear selectores de tratamiento (mantener estilista)
        setFormData(prev => ({
            ...prev,
            categoriaSeleccionada: '',
            tratamientoId: '',
        }));
    };

    // Quitar un tratamiento de la lista
    const handleQuitarTratamiento = (index) => {
        setTratamientosAgregados(prev => prev.filter((_, i) => i !== index));
    };

    // Calcular duración total de tratamientos agregados
    const duracionTotal = tratamientosAgregados.reduce((sum, t) => sum + t.duracion, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (guardando) return;
        setGuardando(true);

        // Combinar fecha + hora en un solo ISO string
        const fechaCombinada = `${formData.soloFecha}T${formData.soloHora}`;

        try {
            // Si hay tratamientos agregados O selectores llenos, construir multi-tratamiento
            let tratamientosFinales = [...tratamientosAgregados];

            // Auto-agregar si los selectores tienen valores y no se presionó "+"
            if (formData.estilistaId && formData.tratamientoId) {
                const tratamiento = TRATAMIENTOS.find(t => t.id === parseInt(formData.tratamientoId));
                const estilista = ESTILISTAS.find(e => e.id === parseInt(formData.estilistaId));
                tratamientosFinales.push({
                    tratamientoId: parseInt(formData.tratamientoId),
                    estilistaId: parseInt(formData.estilistaId),
                    nombre: tratamiento.nombre,
                    estilistaNombre: estilista.nombre,
                    estilistaColor: estilista.color,
                    duracion: tratamiento.duracion,
                });
            }

            if (tratamientosFinales.length === 0) {
                alert('Agrega al menos un tratamiento');
                setGuardando(false);
                return;
            }

            if (tratamientosFinales.length === 1) {
                // Cita normal de un solo tratamiento (backward compat, sin array)
                const unico = tratamientosFinales[0];
                await onSave({
                    ...formData,
                    clienteId: parseInt(formData.clienteId),
                    estilistaId: unico.estilistaId,
                    tratamientoId: unico.tratamientoId,
                    fecha: fechaCombinada,
                    duracion: unico.duracion,
                });
            } else {
                // Multi-tratamiento: campos principales = primer tratamiento
                const primero = tratamientosFinales[0];
                const duracionSuma = tratamientosFinales.reduce((s, t) => s + t.duracion, 0);
                await onSave({
                    ...formData,
                    clienteId: parseInt(formData.clienteId),
                    estilistaId: primero.estilistaId,
                    tratamientoId: primero.tratamientoId,
                    fecha: fechaCombinada,
                    duracion: duracionSuma,
                    tratamientos: tratamientosFinales.map(t => ({
                        tratamientoId: t.tratamientoId,
                        estilistaId: t.estilistaId,
                    })),
                });
            }
        } finally {
            setGuardando(false);
        }
    };

    const handleNewClient = () => {
        if (!newClient.nombre || !newClient.telefono) {
            alert('Nombre y teléfono son obligatorios');
            return;
        }

        const clientId = onAddClient(newClient);
        setFormData({ ...formData, clienteId: clientId });
        setShowNewClient(false);
        setNewClient({ nombre: '', telefono: '', email: '' });
    };

    const handlePaymentConfirm = async (datosPago) => {
        try {
            await onPagar(datosPago);
            setShowPayment(false);
        } catch (error) {
            console.error("Error al pagar:", error);
            alert("Hubo un error al registrar el pago");
        }
    };

    // Si el modal de pago está abierto, mostrarlo
    if (showPayment) {
        const citasCliente = obtenerCitasClienteMismoDia();
        return (
            <PaymentModal
                citasCliente={citasCliente}
                onClose={() => setShowPayment(false)}
                onConfirmPayment={handlePaymentConfirm}
            />
        );
    }

    // Formatear duración para mostrar
    const formatDuracion = (min) => {
        const horas = Math.floor(min / 60);
        const minutos = min % 60;
        if (horas > 0) return `${horas}:${minutos.toString().padStart(2, '0')} hrs`;
        return `${minutos} min`;
    };

    // Ya no usamos solo lectura - siempre editable

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>{esEdicion ? 'Editar Cita' : 'Nueva Cita'}</h2>
                    <button onClick={onClose} className="modal-close">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Cliente</label>
                        {!showNewClient ? (
                            <>
                                <div className="input-with-button">
                                    <select
                                        value={formData.clienteId}
                                        onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccionar cliente</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>{client.nombre}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewClient(true)}
                                        className="btn btn-success btn-sm"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                {selectedClient && (
                                    <div className="client-info-display">
                                        <p className="client-phone">📱 {selectedClient.telefono}</p>
                                        {selectedClient.email && <p className="client-email">✉️ {selectedClient.email}</p>}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="new-client-form">
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={newClient.nombre}
                                    onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })}
                                />
                                <input
                                    type="tel"
                                    placeholder="Teléfono"
                                    value={newClient.telefono}
                                    onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })}
                                />
                                <input
                                    type="email"
                                    placeholder="DNI (opcional)"
                                    value={newClient.email}
                                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                />
                                <div className="button-group">
                                    <button
                                        type="button"
                                        onClick={handleNewClient}
                                        className="btn btn-success"
                                    >
                                        Guardar Cliente
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewClient(false)}
                                        className="btn btn-secondary"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lista de tratamientos agregados (mostrar primero si hay) */}
                    {tratamientosAgregados.length > 0 && (
                        <div className="form-group">
                            <label>Tratamientos</label>
                            <div className="tratamientos-agregados">
                                {tratamientosAgregados.map((t, index) => (
                                    <div
                                        key={index}
                                        className="tratamiento-item"
                                        style={{ borderLeftColor: t.estilistaColor }}
                                    >
                                        <div className="tratamiento-item-info">
                                            <span className="tratamiento-item-nombre">{t.nombre}</span>
                                            <span className="tratamiento-item-detalle">
                                                {t.estilistaNombre} · {formatDuracion(t.duracion)}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="tratamiento-item-remove"
                                            onClick={() => handleQuitarTratamiento(index)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                <div className="duracion-total">
                                    Duración total: {formatDuracion(duracionTotal)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Selectores para agregar más tratamientos */}
                    <div className="form-group">
                        <label>{tratamientosAgregados.length > 0 ? 'Agregar otro tratamiento' : 'Responsable'}</label>
                        <select
                            value={formData.estilistaId}
                            onChange={(e) => setFormData({ ...formData, estilistaId: e.target.value })}
                            required={tratamientosAgregados.length === 0}
                        >
                            <option value="">Seleccionar</option>
                            {ESTILISTAS.map(estilista => (
                                <option key={estilista.id} value={estilista.id}>
                                    {estilista.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Categoría</label>
                        <select
                            value={formData.categoriaSeleccionada || ''}
                            onChange={(e) => setFormData({ ...formData, categoriaSeleccionada: e.target.value, tratamientoId: '' })}
                            required={tratamientosAgregados.length === 0}
                        >
                            <option value="">Seleccionar categoría</option>
                            {categoriasDisponibles.map(categoria => (
                                <option key={categoria} value={categoria}>
                                    {categoria}
                                </option>
                            ))}
                        </select>
                    </div>

                    {formData.categoriaSeleccionada && (
                        <div className="form-group">
                            <label>Tratamiento</label>
                            <select
                                value={formData.tratamientoId}
                                onChange={(e) => setFormData({ ...formData, tratamientoId: e.target.value })}
                                required={tratamientosAgregados.length === 0}
                            >
                                <option value="">Seleccionar tratamiento</option>
                                {TRATAMIENTOS
                                    .filter(t => t.categoria === formData.categoriaSeleccionada)
                                    .map(tratamiento => (
                                        <option key={tratamiento.id} value={tratamiento.id}>
                                            {tratamiento.nombre} ({formatDuracion(tratamiento.duracion)})
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}

                    {/* Botón agregar tratamiento (siempre visible) */}
                    <button
                        type="button"
                        className="btn-agregar-tratamiento"
                        onClick={handleAgregarTratamiento}
                        disabled={!formData.estilistaId || !formData.tratamientoId}
                    >
                        <Plus size={16} />
                        Agregar tratamiento
                    </button>

                    <div className="form-group">
                        <label>Fecha</label>
                        <input
                            type="date"
                            value={formData.soloFecha}
                            onChange={(e) => setFormData({ ...formData, soloFecha: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Hora</label>
                        <select
                            value={formData.soloHora}
                            onChange={(e) => setFormData({ ...formData, soloHora: e.target.value })}
                            required
                        >
                            {slotsHorarios.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Notas (opcional)</label>
                        <textarea
                            value={formData.notas}
                            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                            rows="3"
                            placeholder="Notas adicionales..."
                        />
                    </div>

                    <div className="modal-footer">
                        {esEdicion && !appointment.pagado && (
                            <button
                                type="button"
                                onClick={() => setShowPayment(true)}
                                className="btn"
                                style={{ backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <Banknote size={18} />
                                Cobrar
                            </button>
                        )}
                        {esEdicion && !appointment.pagado && !appointment.cancelado && (
                            <button
                                type="button"
                                onClick={() => onCancelar(appointment.id)}
                                className="btn btn-warning"
                            >
                                Cancelar Cita
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={guardando}
                        >
                            {guardando ? 'Guardando...' : (esEdicion ? 'Actualizar' : 'Guardar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
