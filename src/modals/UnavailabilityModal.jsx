import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ESTILISTAS } from '../constants/salonData';

export default function UnavailabilityModal({ unavailability, onClose, onSave, onDelete }) {
    const [formData, setFormData] = useState(unavailability || {
        estilistaId: '',
        fechaInicio: new Date().toISOString().slice(0, 16),
        fechaFin: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        motivo: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
            alert('La fecha de fin debe ser posterior a la fecha de inicio');
            return;
        }

        onSave({
            ...formData,
            estilistaId: parseInt(formData.estilistaId)
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>{unavailability ? 'Editar Ausencia' : 'Nueva Ausencia'}</h2>
                    <button onClick={onClose} className="modal-close">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
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
                        <label>Fecha y Hora de Inicio</label>
                        <input
                            type="datetime-local"
                            value={formData.fechaInicio}
                            onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Fecha y Hora de Fin</label>
                        <input
                            type="datetime-local"
                            value={formData.fechaFin}
                            onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Motivo (opcional)</label>
                        <textarea
                            value={formData.motivo}
                            onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                            rows="3"
                            placeholder="Ej: Emergencia, Almuerzo, Cita médica..."
                        />
                    </div>

                    <div className="modal-footer">
                        {unavailability && (
                            <button
                                type="button"
                                onClick={() => {
                                    onDelete(unavailability.id);
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
                            className="btn btn-warning"
                        >
                            {unavailability ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}