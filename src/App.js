import { ESTILISTAS, TRATAMIENTOS, HORARIO_INICIO, HORARIO_FIN } from './constants/salonData';
import AppointmentModal from './modals/AppointmentModal';
import DayView from './calendar/DayView';
import WeekView from './calendar/WeekView';
import MonthView from './calendar/MonthView';
import AppointmentCard from './cards/AppointmentCard';
import UnavailabilityCard from './cards/UnavailabilityCard';
import React, { useState, useEffect } from 'react';
import {
  obtenerCitas,
  obtenerClientes,
  obtenerAusencias,
  guardarCita,
  guardarCliente,
  guardarAusencia,
  eliminarCita,
  eliminarCliente,
  eliminarAusencia
} from './services/citasService';
import { Clock, Users, Scissors, Download, Upload, Bell, Plus, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import './App.css';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function SalonAppointmentSystem() {
  const [view, setView] = useState('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [unavailabilities, setUnavailabilities] = useState([]);
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showUnavailabilityModal, setShowUnavailabilityModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editingUnavailability, setEditingUnavailability] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [lastBackupDate, setLastBackupDate] = useState(null);
  const [filterEstilistaId, setFilterEstilistaId] = useState('');

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        // Cargamos todo en paralelo para que sea más rápido
        const [citasDB, clientesDB, ausenciasDB] = await Promise.all([
          obtenerCitas(),
          obtenerClientes(),
          obtenerAusencias()
        ]);

        if (citasDB) setAppointments(citasDB);
        if (clientesDB) setClients(clientesDB);
        if (ausenciasDB) setUnavailabilities(ausenciasDB);

        // El backup sigue siendo local por ahora
        const savedLastBackup = localStorage.getItem('salon_last_backup');
        if (savedLastBackup) setLastBackupDate(savedLastBackup);

      } catch (error) {
        console.error("Error cargando datos:", error);
        alert("Hubo un error cargando los datos. Revisa la consola.");
      }
    };

    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const upcomingAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.fecha);
        const diffMinutes = (aptDate - now) / (1000 * 60);
        return diffMinutes > 0 && diffMinutes <= 10 && !apt.notified;
      });

      if (upcomingAppointments.length > 0) {
        setNotifications(upcomingAppointments);
        setAppointments(prev => prev.map(apt => {
          if (upcomingAppointments.find(ua => ua.id === apt.id)) {
            return { ...apt, notified: true };
          }
          return apt;
        }));
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [appointments]);

  useEffect(() => {
    const checkAutoBackup = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDate = now.toDateString();

      // Solo hacer backup automático a las 21:15 (9:15 PM) si no se ha hecho backup manual hoy
      if (currentHour === 21 && currentMinute === 15 && lastBackupDate !== currentDate) {
        exportData(true); // true = automático
        setLastBackupDate(currentDate);
        localStorage.setItem('salon_last_backup', currentDate);
      }
    };

    checkAutoBackup();
    const interval = setInterval(checkAutoBackup, 60000);
    return () => clearInterval(interval);
  }, [lastBackupDate, appointments, clients, unavailabilities]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getEstilistaById = (id) => ESTILISTAS.find(e => e.id === id);
  const getClientById = (id) => clients.find(c => c.id === id);

  const exportData = () => {
    const data = {
      appointments,
      unavailabilities,
      clients,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-salon-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (window.confirm('¿Deseas reemplazar todos los datos actuales?')) {
            setAppointments(data.appointments || []);
            setUnavailabilities(data.unavailabilities || []);
            setClients(data.clients || []);
            alert('Datos importados correctamente');
          }
        } catch (error) {
          alert('Error al importar el archivo');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <Scissors className="header-icon" />
            <h1>Sistema de Citas</h1>
          </div>
          <div className="header-actions">
            {lastBackupDate && (
              <div className="backup-indicator">
                <span className="backup-text">
                  Último respaldo: {(() => {
                    const lastBackup = new Date(lastBackupDate);
                    const today = new Date();
                    const diffDays = Math.floor((today - lastBackup) / (1000 * 60 * 60 * 24));

                    if (diffDays === 0) return 'Hoy';
                    if (diffDays === 1) return 'Ayer';
                    return `Hace ${diffDays} días`;
                  })()}
                </span>
              </div>
            )}
            <button onClick={() => exportData(false)} className="btn btn-success">
              <Download size={16} />
              Exportar
            </button>
            <label className="btn btn-primary">
              <Upload size={16} />
              Importar
              <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
        {lastBackupDate && (() => {
          const lastBackup = new Date(lastBackupDate);
          const today = new Date();
          const diffDays = Math.floor((today - lastBackup) / (1000 * 60 * 60 * 24));

          if (diffDays >= 7) {
            return (
              <div className="backup-warning">
                <Bell size={16} />
                <span>⚠️ Han pasado {diffDays} días sin backup. Se recomienda exportar los datos.</span>
                <button onClick={() => exportData(false)} className="btn btn-sm btn-success">
                  Exportar Ahora
                </button>
              </div>
            );
          }
          return null;
        })()}
      </header>

      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map(apt => {
            const estilista = getEstilistaById(apt.estilistaId);
            const client = getClientById(apt.clienteId);
            const minutosRestantes = Math.max(0, Math.ceil((new Date(apt.fecha) - new Date()) / (1000 * 60)));
            return (
              <div key={apt.id} className="notification">
                <Bell size={20} />
                <div className="notification-content">
                  <p className="notification-title">
                    Cita en {minutosRestantes} {minutosRestantes === 1 ? 'minuto' : 'minutos'}
                  </p>
                  <p className="notification-text">{estilista?.nombre} - {client?.nombre}</p>
                  <p className="notification-time">{formatTime(apt.fecha)}</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== apt.id))}
                  className="notification-close"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <nav className="app-nav">
        <div className="nav-content">
          <div className="view-buttons">
            <button onClick={() => setView('day')} className={`btn ${view === 'day' ? 'btn-primary' : 'btn-secondary'}`}>
              Día
            </button>
            <button onClick={() => setView('week')} className={`btn ${view === 'week' ? 'btn-primary' : 'btn-secondary'}`}>
              Semana
            </button>
            <button onClick={() => setView('month')} className={`btn ${view === 'month' ? 'btn-primary' : 'btn-secondary'}`}>
              Mes
            </button>
          </div>
          <div className="date-navigation">
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                if (view === 'day') newDate.setDate(newDate.getDate() - 1);
                else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
                else newDate.setMonth(newDate.getMonth() - 1);
                setCurrentDate(newDate);
              }}
              className="btn btn-icon"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="current-date">{formatDate(currentDate)}</span>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                if (view === 'day') newDate.setDate(newDate.getDate() + 1);
                else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
                else newDate.setMonth(newDate.getMonth() + 1);
                setCurrentDate(newDate);
              }}
              className="btn btn-icon"
            >
              <ChevronRight size={20} />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="btn btn-secondary">
              Hoy
            </button>
          </div>
          <div className="action-buttons">
            <select
              value={filterEstilistaId}
              onChange={(e) => setFilterEstilistaId(e.target.value)}
              className="btn btn-secondary"
              style={{ marginRight: '8px', paddingRight: '30px' }} // Ajuste visual
            >
              <option value="">Todos</option>
              {ESTILISTAS.map(estilista => (
                <option key={estilista.id} value={estilista.id}>
                  {estilista.nombre}
                </option>
              ))}
            </select>
            <button onClick={() => setShowUnavailabilityModal(true)} className="btn btn-danger">
              <X size={16} />
              Crear ausencia
            </button>
            <button onClick={() => setShowClientModal(true)} className="btn btn-purple">
              <Users size={16} />
              Clientes
            </button>
            <button onClick={() => { setEditingAppointment(null); setShowModal(true); }} className="btn btn-primary">
              <Plus size={16} />
              Nueva Cita
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        {view === 'day' && (
          <DayView
            currentDate={currentDate}
            appointments={appointments}
            unavailabilities={unavailabilities}
            filterEstilistaId={filterEstilistaId}
            setEditingAppointment={setEditingAppointment}
            setEditingUnavailability={setEditingUnavailability}
            setShowModal={setShowModal}
            setShowUnavailabilityModal={setShowUnavailabilityModal}
          />
        )}
        {view === 'week' && (
          <WeekView
            currentDate={currentDate}
            appointments={appointments}
            unavailabilities={unavailabilities}
            filterEstilistaId={filterEstilistaId}
            setEditingAppointment={setEditingAppointment}
            setEditingUnavailability={setEditingUnavailability}
            setShowModal={setShowModal}
            setShowUnavailabilityModal={setShowUnavailabilityModal}
          />
        )}
        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            appointments={appointments}
            unavailabilities={unavailabilities}
            filterEstilistaId={filterEstilistaId}
            setEditingAppointment={setEditingAppointment}
            setEditingUnavailability={setEditingUnavailability}
            setShowModal={setShowModal}
            setShowUnavailabilityModal={setShowUnavailabilityModal}
          />
        )}
      </main>

      {showModal && (
        <AppointmentModal
          appointment={editingAppointment}
          onClose={() => {
            setShowModal(false);
            setEditingAppointment(null);
          }}
          onSave={async (apt) => { // Nota el async
            try {
              // 1. Guardar en BD (Supabase o LocalStorage según el servicio)
              const citaGuardada = await guardarCita(apt);

              // 2. Actualizar estado visual (UI)
              if (editingAppointment) {
                setAppointments(prev => prev.map(a => a.id === citaGuardada.id ? citaGuardada : a));
              } else {
                // Usamos citaGuardada porque si es Supabase, él genera el ID real
                setAppointments(prev => [...prev, citaGuardada]);
              }

              setShowModal(false);
              setEditingAppointment(null);
            } catch (error) {
              alert("Error al guardar la cita");
              console.error(error);
            }
          }}

          onDelete={async (id) => { // Nota el async
            if (window.confirm('¿Eliminar cita?')) {
              await eliminarCita(id); // Llamada al servicio
              setAppointments(prev => prev.filter(a => a.id !== id));
              setShowModal(false);
              setEditingAppointment(null);
            }
          }}
          clients={clients}
          onAddClient={(client) => {
            setClients(prev => [...prev, { ...client, id: Date.now() }]);
            return Date.now();
          }}
        />
      )}

      {showUnavailabilityModal && (
        <UnavailabilityModal
          unavailability={editingUnavailability}
          onClose={() => {
            setShowUnavailabilityModal(false);
            setEditingUnavailability(null);
          }}
          onSave={async (unav) => {
            try {
              // 1. Guardar en BD (o localStorage vía servicio)
              const ausenciaGuardada = await guardarAusencia(unav);

              // 2. Actualizar UI
              if (editingUnavailability) {
                setUnavailabilities(prev => prev.map(u => u.id === ausenciaGuardada.id ? ausenciaGuardada : u));
              } else {
                setUnavailabilities(prev => [...prev, ausenciaGuardada]);
              }

              setShowUnavailabilityModal(false);
              setEditingUnavailability(null);
            } catch (error) {
              console.error(error);
              alert("Error al guardar la ausencia");
            }
          }}
          onDelete={async (id) => {
            if (window.confirm('¿Estás seguro de eliminar esta indisponibilidad?')) {
              try {
                await eliminarAusencia(id);
                setUnavailabilities(prev => prev.filter(u => u.id !== id));
                setShowUnavailabilityModal(false);
                setEditingUnavailability(null);
              } catch (error) {
                console.error(error);
                alert("Error al eliminar la ausencia");
              }
            }
          }}
        />
      )}

      {showClientModal && (
        <ClientModal
          clients={clients}
          onClose={() => setShowClientModal(false)}
          onSave={async (clientData) => {
            try {
              // 1. Guardar cliente
              const clienteGuardado = await guardarCliente(clientData);

              // 2. Actualizar la lista en pantalla (Buscamos si ya existe para actualizar o agregar)
              setClients(prev => {
                const existe = prev.some(c => c.id === clienteGuardado.id);
                if (existe) {
                  return prev.map(c => c.id === clienteGuardado.id ? clienteGuardado : c);
                } else {
                  return [...prev, clienteGuardado];
                }
              });

            } catch (error) {
              console.error(error);
              alert("Error al guardar el cliente");
            }
          }}
          onDelete={async (id) => {
            try {
              await eliminarCliente(id);
              setClients(prev => prev.filter(c => c.id !== id));
            } catch (error) {
              console.error(error);
              alert("Error al eliminar el cliente");
            }
          }}
        />
      )}
    </div>
  );
}

function UnavailabilityModal({ unavailability, onClose, onSave, onDelete }) {
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

function ClientModal({ clients, onClose, onSave, onDelete }) {
  const [editingClient, setEditingClient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', telefono: '', email: '', notas: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telefono.includes(searchTerm)
  );

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