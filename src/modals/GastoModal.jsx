import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { ESTILISTAS } from '../constants/salonData';

export default function GastoModal({ gasto, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    encargadaId: gasto?.encargadaId || '',
    descripcion: gasto?.descripcion || '',
    monto: gasto?.monto || '',
    fecha: gasto?.fecha
      ? new Date(gasto.fecha).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.encargadaId || !formData.descripcion || !formData.monto) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const gastoData = {
      ...formData,
      id: gasto?.id || Date.now(),
      encargadaId: parseInt(formData.encargadaId),
      monto: parseFloat(formData.monto),
      fecha: new Date(formData.fecha).toISOString()
    };

    onSave(gastoData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{gasto ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Encargada *</label>
            <select
              name="encargadaId"
              value={formData.encargadaId}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Seleccionar encargada</option>
              {ESTILISTAS.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Descripcion *</label>
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Ej: Compra de productos, almuerzo, etc."
            />
          </div>

          <div className="form-group">
            <label>Monto (S/.) *</label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              required
              min="0"
              step="0.10"
              className="form-control"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>Fecha y Hora</label>
            <input
              type="datetime-local"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="modal-footer">
            {gasto && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(gasto.id)}
                className="btn btn-danger"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            )}
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {gasto ? 'Guardar Cambios' : 'Crear Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
