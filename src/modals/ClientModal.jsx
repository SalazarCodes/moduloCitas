import React, { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';

export default function ClientModal({ clients, onClose, onSave, onDelete }) {
    const [editingClient, setEditingClient] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ nombre: '', telefono: '', email: '', notas: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = clients
        .filter(client =>
            client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.telefono.includes(searchTerm)
        )
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(editingClient ? { ...formData, id: editingClient.id } : formData);
        setShowForm(false);
        setEditingClient(null);
        setFormData({ nombre: '', telefono: '', email: '', notas: '' });
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setFormData(client);
        setShowForm(true);
    };

    return (
        <div className="modal-overlay">
            <div className="modal modal-large">
                <div className="modal-header">
                    <h2>Gestión de Clientes</h2>
                    <button onClick={onClose} className="modal-close">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {!showForm ? (
                        <>
                            <div className="search-bar">
                                <div className="search-input">
                                    <Search size={20} />
                                    <input
                                        type="text"
                                        placeholder="Buscar cliente..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setShowForm(true);
                                        setEditingClient(null);
                                        setFormData({ nombre: '', telefono: '', email: '', notas: '' });
                                    }}
                                    className="btn btn-primary"
                                >
                                    <Plus size={16} />
                                    Nuevo
                                </button>
                            </div>

                            <div className="client-list">
                                {filteredClients.length === 0 ? (
                                    <div className="empty-state">No hay clientes registrados</div>
                                ) : (
                                    filteredClients.map(client => (
                                        <div key={client.id} className="client-card">
                                            <div className="client-info">
                                                <h3>{client.nombre}</h3>
                                                <p>📱 {client.telefono}</p>
                                                {client.email && <p>✉️ {client.email}</p>}
                                                {client.notas && <p className="client-notes">{client.notas}</p>}
                                            </div>
                                            <div className="client-actions">
                                                <button
                                                    onClick={() => handleEdit(client)}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('¿Eliminar este cliente?')) {
                                                            onDelete(client.id);
                                                        }
                                                    }}
                                                    className="btn btn-sm btn-danger"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="client-form">
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Teléfono *</label>
                                <input
                                    type="tel"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>DNI</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={formData.email}
                                    onChange={(e) => {
                                        const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 8);
                                        setFormData({ ...formData, email: soloNumeros });
                                    }}
                                    placeholder="8 dígitos"
                                />
                            </div>

                            <div className="form-group">
                                <label>Notas</label>
                                <textarea
                                    value={formData.notas}
                                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                    rows="3"
                                    placeholder="Preferencias, alergias, etc..."
                                />
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingClient(null);
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    {editingClient ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}