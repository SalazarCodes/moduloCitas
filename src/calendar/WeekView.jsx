import { HORARIO_INICIO, HORARIO_FIN } from '../constants/salonData';
import AppointmentCard from '../cards/AppointmentCard';
import UnavailabilityCard from '../cards/UnavailabilityCard';

export default function WeekView({ currentDate, appointments, unavailabilities, filterEstilistaId, setEditingAppointment, setEditingUnavailability, setShowModal, setShowUnavailabilityModal, clients = [] }) {
    const hours = Array.from({ length: HORARIO_FIN - HORARIO_INICIO }, (_, i) => i + HORARIO_INICIO);

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return day;
    });

    // Filtrar citas por día
    const getAppointmentsForDay = (day) => {
        return appointments.filter(apt => {
            if (apt.cancelado) return false;
            const aptDate = new Date(apt.fecha);
            const coincideFecha = aptDate.toDateString() === day.toDateString();
            const coincideEstilista = filterEstilistaId ? apt.estilistaId === parseInt(filterEstilistaId) : true;
            return coincideFecha && coincideEstilista;
        });
    };

    // Filtrar ausencias por día
    const getUnavailabilitiesForDay = (day) => {
        return unavailabilities.filter(unav => {
            const unavDate = new Date(unav.fechaInicio);
            const coincideFecha = unavDate.toDateString() === day.toDateString();
            const coincideEstilista = filterEstilistaId ? unav.estilistaId === parseInt(filterEstilistaId) : true;
            return coincideFecha && coincideEstilista;
        });
    };

    // Obtener citas de una hora específica
    const getAppointmentsForHour = (dayAppointments, hour) => {
        return dayAppointments.filter(apt => {
            const aptHour = new Date(apt.fecha).getHours();
            return aptHour === hour;
        });
    };

    // Obtener ausencias de una hora específica
    const getUnavailabilitiesForHour = (dayUnavailabilities, hour) => {
        return dayUnavailabilities.filter(unav => {
            const startHour = new Date(unav.fechaInicio).getHours();
            const endHour = new Date(unav.fechaFin).getHours();
            return hour >= startHour && hour < endHour;
        });
    };

    const isToday = (day) => day.toDateString() === new Date().toDateString();

    return (
        <div className="view-card">
            <h2>Agenda de la Semana</h2>
            <div className="week-view-grid">
                {/* Header con días */}
                <div className="week-grid-header">
                    <div className="week-hour-label-header"></div>
                    {days.map((day, index) => (
                        <div key={index} className={`week-day-header-cell ${isToday(day) ? 'today' : ''}`}>
                            <div className="week-day-name">
                                {day.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}
                            </div>
                            <div className="week-day-number">
                                {day.getDate()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filas por hora */}
                <div className="week-grid-body">
                    {hours.map(hour => (
                        <div key={hour} className="week-hour-row">
                            <div className="week-hour-label">
                                {hour.toString().padStart(2, '0')}:00
                            </div>
                            {days.map((day, dayIndex) => {
                                const dayAppointments = getAppointmentsForDay(day);
                                const dayUnavailabilities = getUnavailabilitiesForDay(day);
                                const hourAppointments = getAppointmentsForHour(dayAppointments, hour);
                                const hourUnavailabilities = getUnavailabilitiesForHour(dayUnavailabilities, hour);

                                return (
                                    <div key={dayIndex} className={`week-cell ${isToday(day) ? 'today' : ''}`}>
                                        {hourUnavailabilities.map(unav => (
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
                                        {hourAppointments.map(apt => (
                                            <AppointmentCard
                                                key={apt.id}
                                                appointment={apt}
                                                compact
                                                allAppointments={appointments}
                                                clients={clients}
                                                onClick={() => {
                                                    setEditingAppointment(apt);
                                                    setShowModal(true);
                                                }}
                                            />
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
