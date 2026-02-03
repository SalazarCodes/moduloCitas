import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { ESTILISTAS, TRATAMIENTOS } from '../constants/salonData';

export default function AppointmentModal({ appointment, onClose, onSave, onDelete, clients, onAddClient }) {
    const categoriasDisponibles = [...new Set(TRATAMIENTOS.map(t => t.categoria))];
    const [formData, setFormData] = useState(appointment ? {
        ...appointment,
        categoriaSeleccionada: appointment.tratamientoId
            ? TRATAMIENTOS.find(t => t.id === appointment.tratamientoId)?.categoria
            : ''
    } : {
        clienteId: '',
        estilistaId: '',
        tratamientoId: '',
        categoriaSeleccionada: '',
        fecha: new Date().toISOString().slice(0, 16),
        notas: ''
    });

    const [showNewClient, setShowNewClient] = useState(false);
    const [newClient, setNewClient] = useState({ nombre: '', telefono: '', email: '' });

    const selectedClient = formData.clienteId ? clients.find(c => c.id === parseInt(formData.clienteId)) : null;

    const handleSubmit = (e) => {
        e.preventDefault();

        const tratamiento = TRATAMIENTOS.find(t => t.id === parseInt(formData.tratamientoId));

        onSave({
            ...formData,
            clienteId: parseInt(formData.clienteId),
            estilistaId: parseInt(formData.estilistaId),
            tratamientoId: parseInt(formData.tratamientoId),
            duracion: tratamiento.duracion
        });
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

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>{appointment ? 'Editar Cita' : 'Nueva Cita'}</h2>
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

                    <div className="form-group">
                        <label>Responsable</label>
                        <select
                            value={formData.estilistaId}
                            onChange={(e) => setFormData({ ...formData, estilistaId: e.target.value })}
                            required
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
                            required
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
                                required
                            >
                                <option value="">Seleccionar tratamiento</option>
                                {TRATAMIENTOS
                                    .filter(t => t.categoria === formData.categoriaSeleccionada)
                                    .map(tratamiento => {
                                        const horas = Math.floor(tratamiento.duracion / 60);
                                        const minutos = tratamiento.duracion % 60;
                                        const duracionTexto = horas > 0
                                            ? `${horas}:${minutos.toString().padStart(2, '0')} hrs`
                                            : `${minutos} min`;

                                        return (
                                            <option key={tratamiento.id} value={tratamiento.id}>
                                                {tratamiento.nombre} ({duracionTexto})
                                            </option>
                                        );
                                    })}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Fecha y Hora</label>
                        <input
                            type="datetime-local"
                            value={formData.fecha}
                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                            required
                        />
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
                        {appointment && (
                            <button
                                type="button"
                                onClick={() => {
                                    onDelete(appointment.id);
                                }}
                                className="btn btn-danger"
                            >
                                Eliminar
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
                        >
                            {appointment ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}