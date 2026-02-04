import { ESTILISTAS } from './constants/salonData';
import AppointmentModal from './modals/AppointmentModal';
import UnavailabilityModal from './modals/UnavailabilityModal';
import ClientModal from './modals/ClientModal';
import DayView from './calendar/DayView';
import WeekView from './calendar/WeekView';
import MonthView from './calendar/MonthView';
import Sidebar from './Sidebar';
import HistorialPagos from './HistorialPagos';
import HistorialCitas from './HistorialCitas';
import React, { useState, useEffect } from 'react';
import {
  obtenerCitas,
  obtenerClientes,
  obtenerAusencias,
  obtenerPagos,
  guardarCita,
  guardarCliente,
  guardarAusencia,
  eliminarCita,
  eliminarCliente,
  eliminarAusencia,
  registrarPago,
  marcarCitasPagadas
} from './services/citasService';
import { Users, Download, Upload, Bell, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './App.css';

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
  const [moduloActivo, setModuloActivo] = useState('citas');
  const [pagos, setPagos] = useState([]);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        // Cargamos todo en paralelo para que sea más rápido
        const [citasDB, clientesDB, ausenciasDB, pagosDB] = await Promise.all([
          obtenerCitas(),
          obtenerClientes(),
          obtenerAusencias(),
          obtenerPagos()
        ]);

        if (citasDB) setAppointments(citasDB);
        if (clientesDB) setClients(clientesDB);
        if (ausenciasDB) setUnavailabilities(ausenciasDB);
        if (pagosDB) setPagos(pagosDB);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="app-layout">
      <Sidebar moduloActivo={moduloActivo} onCambiarModulo={setModuloActivo} />
      <div className="app-container">

      {moduloActivo === 'historialCitas' && (
        <HistorialCitas appointments={appointments} clients={clients} />
      )}

      {moduloActivo === 'historial' && (
        <HistorialPagos pagos={pagos} />
      )}

      {moduloActivo === 'citas' && (<>
      <header className="app-header">
        <div className="header-content">
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
          appointments={appointments}
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

          onPagar={async (datosPago) => {
            try {
              // Enriquecer con nombre del cliente
              const citaRef = appointments.find(a => datosPago.citaIds.includes(a.id));
              const cliente = citaRef ? getClientById(citaRef.clienteId) : null;
              const pagoEnriquecido = {
                ...datosPago,
                clienteNombre: cliente ? cliente.nombre : 'Sin nombre'
              };

              // 1. Registrar el pago en BD
              const pagoGuardado = await registrarPago(pagoEnriquecido);

              // 2. Marcar todas las citas incluidas como pagadas en BD
              await marcarCitasPagadas(datosPago.citaIds);

              // 3. Actualizar estado visual (UI)
              setAppointments(prev => prev.map(a =>
                datosPago.citaIds.includes(a.id) ? { ...a, pagado: true } : a
              ));

              // 4. Agregar pago al historial local
              setPagos(prev => [...prev, pagoGuardado || pagoEnriquecido]);

              // 5. Cerrar modal
              setShowModal(false);
              setEditingAppointment(null);
            } catch (error) {
              console.error("Error al registrar el pago:", error);
              throw error; // Re-lanzar para que AppointmentModal muestre el alert
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
      </>)}
    </div>
    </div>
  );
}