import React, { useState, useEffect } from 'react';
import { Clock, Users, Scissors, Download, Upload, Bell, Plus, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import './App.css';

// ============================================
// CONFIGURACIÓN - Edita aquí para personalizar
// ============================================

const ESTILISTAS = [
  { id: 1, nombre: "Noelia", especialidad: "Cabello", color: "#3B82F6" },
  { id: 2, nombre: "Kathy", especialidad: "Tratamientos corporales", color: "#A855F7" },
  { id: 3, nombre: "Yazmine", especialidad: "Uñas", color: "#10B981" },
  { id: 4, nombre: "Kati", especialidad: "Todo terreno", color: "#9F0BF5" },
  { id: 5, nombre: "Sharom", especialidad: "Cara", color: "#8F0A3D" },
];

const TRATAMIENTOS = [
  { id: 1, nombre: "Botox Capilar", duracion: 90, categoria: "Cabello" },
  { id: 2, nombre: "Tinte + botox", duracion: 120, categoria: "Cabello" },
  { id: 3, nombre: "Tinte + tratamiento", duracion: 90, categoria: "Cabello" },
  { id: 4, nombre: "Tinte", duracion: 70, categoria: "Cabello" },
  { id: 5, nombre: "Tratamiento", duracion: 60, categoria: "Cabello" },
  { id: 6, nombre: "Corte de puntas", duracion: 20, categoria: "Cabello" },
  { id: 7, nombre: "Corte forma", duracion: 30, categoria: "Cabello" },
  { id: 8, nombre: "Corte + lavado", duracion: 40, categoria: "Cabello" },
  { id: 9, nombre: "Corte + lavado + tratamiento", duracion: 70, categoria: "Cabello" },
  { id: 10, nombre: "Corte + lavado + planchado", duracion: 70, categoria: "Cabello" },
  { id: 11, nombre: "Mechas bayalage", duracion: 240, categoria: "Cabello" },
  { id: 12, nombre: "Mechas general", duracion: 300, categoria: "Cabello" },
  { id: 13, nombre: "Mechas creativas", duracion: 300, categoria: "Cabello" },
  { id: 14, nombre: "Alisado organico", duracion: 120, categoria: "Cabello" },
  { id: 15, nombre: "Alisado japones", duracion: 240, categoria: "Cabello" },
  { id: 16, nombre: "Alisado dual", duracion: 240, categoria: "Cabello" },
  { id: 17, nombre: "Alisado brasilero", duracion: 90, categoria: "Cabello" },
  { id: 18, nombre: "Lavado + planchado", duracion: 90, categoria: "Cabello" },
  { id: 19, nombre: "Pintado Gel", duracion: 30, categoria: "Uñas" },
  { id: 20, nombre: "Pintado Tradicional", duracion: 20, categoria: "Uñas" },
  { id: 21, nombre: "Reforzamiento Gum Gel", duracion: 90, categoria: "Uñas" },
  { id: 22, nombre: "Uñas Acrílicas", duracion: 120, categoria: "Uñas" },
  { id: 23, nombre: "Pedicure Gel", duracion: 90, categoria: "Uñas" },
  { id: 24, nombre: "Pedicure Tradicional", duracion: 40, categoria: "Uñas" },
  { id: 25, nombre: "Uñas Rubber", duracion: 90, categoria: "Uñas" },
  { id: 26, nombre: "Gum Gel Extension", duracion: 120, categoria: "Uñas" },
  { id: 27, nombre: "Extension de pestañas", duracion: 120, categoria: "Cara" },
  { id: 28, nombre: "Retiro de pestañas", duracion: 20, categoria: "Cara" },
  { id: 29, nombre: "Lifting", duracion: 60, categoria: "Cara" },
  { id: 30, nombre: "Laminado", duracion: 40, categoria: "Cara" },
  { id: 31, nombre: "Henna", duracion: 40, categoria: "Cara" },
  { id: 32, nombre: "Micropigmentacion", duracion: 180, categoria: "Cara" },
  { id: 33, nombre: "Botox", duracion: 40, categoria: "Cara" },
  { id: 34, nombre: "Depilacion Cejas Cera", duracion: 30, categoria: "Cara" },
  { id: 35, nombre: "Depilacion Cejas Hilo", duracion: 20, categoria: "Cara" },
  { id: 36, nombre: "Depilacion Bozo Cera", duracion: 30, categoria: "Cara" },
  { id: 37, nombre: "Depilacion Bozo Hilo", duracion: 20, categoria: "Cara" },
  { id: 38, nombre: "Depilacion Total Cara", duracion: 60, categoria: "Cara" },
  { id: 39, nombre: "Facial", duracion: 60, categoria: "Cara" },
  { id: 40, nombre: "Hidralips", duracion: 60, categoria: "Cara" },
  { id: 41, nombre: "Microblading", duracion: 180, categoria: "Cara" },
  { id: 42, nombre: "Peeling", duracion: 60, categoria: "Cara" },
  { id: 43, nombre: "Retoque Labios", duracion: 150, categoria: "Cara" },
  { id: 44, nombre: "Retoque Microblading", duracion: 150, categoria: "Cara" },
];

const HORARIO_INICIO = 10; // 10 AM
const HORARIO_FIN = 21; // 9 PM

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

  useEffect(() => {
    const savedAppointments = localStorage.getItem('salon_appointments');
    const savedUnavailabilities = localStorage.getItem('salon_unavailabilities');
    const savedClients = localStorage.getItem('salon_clients');
    const savedLastBackup = localStorage.getItem('salon_last_backup');

    if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
    if (savedUnavailabilities) setUnavailabilities(JSON.parse(savedUnavailabilities));
    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedLastBackup) setLastBackupDate(savedLastBackup);
  }, []);

  useEffect(() => {
    localStorage.setItem('salon_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('salon_unavailabilities', JSON.stringify(unavailabilities));
  }, [unavailabilities]);

  useEffect(() => {
    localStorage.setItem('salon_clients', JSON.stringify(clients));
  }, [clients]);

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
          onSave={(apt) => {
            if (editingAppointment) {
              setAppointments(prev => prev.map(a => a.id === apt.id ? apt : a));
            } else {
              setAppointments(prev => [...prev, { ...apt, id: Date.now(), notified: false }]);
            }
            setShowModal(false);
            setEditingAppointment(null);
          }}
          onDelete={(id) => {
            setAppointments(prev => prev.filter(a => a.id !== id));
            setShowModal(false);
            setEditingAppointment(null);
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
          onSave={(unav) => {
            if (editingUnavailability) {
              setUnavailabilities(prev => prev.map(u => u.id === unav.id ? unav : u));
            } else {
              setUnavailabilities(prev => [...prev, { ...unav, id: Date.now() }]);
            }
            setShowUnavailabilityModal(false);
            setEditingUnavailability(null);
          }}
          onDelete={(id) => {
            setUnavailabilities(prev => prev.filter(u => u.id !== id));
            setShowUnavailabilityModal(false);
            setEditingUnavailability(null);
          }}
        />
      )}

      {showClientModal && (
        <ClientModal
          clients={clients}
          onClose={() => setShowClientModal(false)}
          onSave={(client) => {
            if (client.id) {
              setClients(prev => prev.map(c => c.id === client.id ? client : c));
            } else {
              setClients(prev => [...prev, { ...client, id: Date.now() }]);
            }
          }}
          onDelete={(id) => {
            setClients(prev => prev.filter(c => c.id !== id));
          }}
        />
      )}
    </div>
  );
}

function DayView({ currentDate, appointments, unavailabilities, setEditingAppointment, setEditingUnavailability, setShowModal, setShowUnavailabilityModal }) {
  const hours = Array.from({ length: HORARIO_FIN - HORARIO_INICIO }, (_, i) => i + HORARIO_INICIO);

  const dayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.fecha);
    return aptDate.toDateString() === currentDate.toDateString();
  }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const dayUnavailabilities = unavailabilities.filter(unav => {
    const unavDate = new Date(unav.fechaInicio);
    return unavDate.toDateString() === currentDate.toDateString();
  });

  return (
    <div className="view-card">
      <h2>Agenda del Día</h2>
      <div className="day-view">
        {hours.map(hour => {
          const hourAppointments = dayAppointments.filter(apt => {
            const aptHour = new Date(apt.fecha).getHours();
            return aptHour === hour;
          });

          const hourUnavailabilities = dayUnavailabilities.filter(unav => {
            const startHour = new Date(unav.fechaInicio).getHours();
            const endHour = new Date(unav.fechaFin).getHours();
            return hour >= startHour && hour < endHour;
          });

          return (
            <div key={hour} className="hour-row">
              <div className="hour-label">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="hour-content">
                {(hourUnavailabilities.length > 0 || hourAppointments.length > 0) && (
                  <div className="hour-items-grid">
                    {hourUnavailabilities.map(unav => (
                      <UnavailabilityCard
                        key={unav.id}
                        unavailability={unav}
                        onClick={() => {
                          setEditingUnavailability(unav);
                          setShowUnavailabilityModal(true);
                        }}
                      />
                    ))}
                    {hourAppointments.map(apt => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        onClick={() => {
                          setEditingAppointment(apt);
                          setShowModal(true);
                        }}
                      />
                    ))}
                  </div>
                )}
                {!hourUnavailabilities.length && !hourAppointments.length && (
                  <div className="no-appointments">Sin citas</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ currentDate, appointments, unavailabilities, setEditingAppointment, setEditingUnavailability, setShowModal, setShowUnavailabilityModal }) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  return (
    <div className="view-card">
      <h2>Agenda de la Semana</h2>
      <div className="week-view">
        {days.map((day, index) => {
          const dayAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.fecha);
            return aptDate.toDateString() === day.toDateString();
          }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

          const dayUnavailabilities = unavailabilities.filter(unav => {
            const unavDate = new Date(unav.fechaInicio);
            return unavDate.toDateString() === day.toDateString();
          });

          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div key={index} className={`week-day ${isToday ? 'today' : ''}`}>
              <div className="week-day-header">
                <div className="week-day-name">
                  {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                </div>
                <div className="week-day-number">
                  {day.getDate()}
                </div>
              </div>
              <div className="week-day-content">
                {dayUnavailabilities.map(unav => (
                  <div
                    key={unav.id}
                    onClick={() => {
                      setEditingUnavailability(unav);
                      setShowUnavailabilityModal(true);
                    }}
                  >
                    <UnavailabilityCard unavailability={unav} compact />
                  </div>
                ))}
                {dayAppointments.map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => {
                      setEditingAppointment(apt);
                      setShowModal(true);
                    }}
                  >
                    <AppointmentCard appointment={apt} compact />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({ currentDate, appointments, unavailabilities, setEditingAppointment, setEditingUnavailability, setShowModal, setShowUnavailabilityModal }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days = [];
  const current = new Date(startDate);

  while (days.length < 35) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return (
    <div className="view-card">
      <h2>Calendario Mensual</h2>
      <div className="month-view">
        <div className="month-header">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="month-day-name">{day}</div>
          ))}
        </div>
        <div className="month-grid">
          {days.map((day, index) => {
            const dayAppointments = appointments.filter(apt => {
              const aptDate = new Date(apt.fecha);
              return aptDate.toDateString() === day.toDateString();
            });

            const dayUnavailabilities = unavailabilities.filter(unav => {
              const unavDate = new Date(unav.fechaInicio);
              return unavDate.toDateString() === day.toDateString();
            });

            const isCurrentMonth = day.getMonth() === month;
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`month-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
              >
                <div className="month-day-number">{day.getDate()}</div>
                <div className="month-day-appointments">
                  {dayUnavailabilities.slice(0, 2).map(unav => {
                    const estilista = ESTILISTAS.find(e => e.id === unav.estilistaId);
                    return (
                      <div
                        key={unav.id}
                        onClick={() => {
                          setEditingUnavailability(unav);
                          setShowUnavailabilityModal(true);
                        }}
                        className="month-appointment"
                        style={{
                          backgroundColor: '#fee2e2',
                          borderLeft: '3px solid #dc2626'
                        }}
                      >
                        {estilista?.nombre}
                      </div>
                    );
                  })}
                  {dayAppointments.slice(0, 3).map(apt => {
                    const estilista = ESTILISTAS.find(e => e.id === apt.estilistaId);
                    return (
                      <div
                        key={apt.id}
                        onClick={() => {
                          setEditingAppointment(apt);
                          setShowModal(true);
                        }}
                        className="month-appointment"
                        style={{
                          backgroundColor: estilista?.color + '30',
                          borderLeft: `3px solid ${estilista?.color}`
                        }}
                      >
                        {new Date(apt.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    );
                  })}
                  {(dayAppointments.length + dayUnavailabilities.length) > 3 && (
                    <div className="month-more">+{(dayAppointments.length + dayUnavailabilities.length) - 3} más</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment, onClick, compact = false }) {
  const estilista = ESTILISTAS.find(e => e.id === appointment.estilistaId);
  const tratamiento = TRATAMIENTOS.find(t => t.id === appointment.tratamientoId);
  const client = JSON.parse(localStorage.getItem('salon_clients') || '[]').find(c => c.id === appointment.clienteId);

  return (
    <div
      onClick={onClick}
      className="appointment-card"
      style={{
        backgroundColor: estilista?.color + '20',
        borderLeft: `4px solid ${estilista?.color}`
      }}
    >
      <div className="appointment-estilista" style={{ color: estilista?.color }}>
        {estilista?.nombre}
      </div>
      {!compact && (
        <>
          <div className="appointment-client">{client?.nombre}</div>
          <div className="appointment-treatment">{tratamiento?.nombre}</div>
          <div className="appointment-time">
            <Clock size={14} />
            {new Date(appointment.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {tratamiento?.duracion} min
          </div>
        </>
      )}
      {compact && (
        <div className="appointment-time-compact" style={{ color: estilista?.color }}>
          {new Date(appointment.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
}

function UnavailabilityCard({ unavailability, onClick, compact = false }) {
  const estilista = ESTILISTAS.find(e => e.id === unavailability.estilistaId);

  return (
    <div
      onClick={onClick}
      className="appointment-card unavailability-card"
      style={{
        backgroundColor: '#fee2e2',
        borderLeft: '4px solid #dc2626'
      }}
    >
      <div className="appointment-estilista" style={{ color: '#dc2626' }}>
        {estilista?.nombre} - Ausente
      </div>
      {!compact && (
        <>
          <div className="appointment-treatment">{unavailability.motivo || 'Sin motivo especificado'}</div>
          <div className="appointment-time">
            <Clock size={14} />
            {new Date(unavailability.fechaInicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {new Date(unavailability.fechaFin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </>
      )}
      {compact && (
        <div className="appointment-time-compact" style={{ color: '#dc2626' }}>
          {new Date(unavailability.fechaInicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {new Date(unavailability.fechaFin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
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
                  if (window.confirm('¿Estás seguro de eliminar esta indisponibilidad?')) {
                    onDelete(unavailability.id);
                  }
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
              className="btn btn-danger"
            >
              {unavailability ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function AppointmentModal({ appointment, onClose, onSave, onDelete, clients, onAddClient }) {
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
                  if (window.confirm('¿Estás seguro de eliminar esta cita?')) {
                    onDelete(appointment.id);
                  }
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
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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