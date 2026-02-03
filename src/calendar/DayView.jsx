import { HORARIO_INICIO, HORARIO_FIN, ESTILISTAS } from '../constants/salonData';
import AppointmentCard from '../cards/AppointmentCard';
import UnavailabilityCard from '../cards/UnavailabilityCard';

export default function DayView({ currentDate, appointments, unavailabilities, filterEstilistaId, setEditingAppointment, setEditingUnavailability, setShowModal, setShowUnavailabilityModal }) {
    const hours = Array.from({ length: HORARIO_FIN - HORARIO_INICIO }, (_, i) => i + HORARIO_INICIO);

    const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.fecha);
        const coincideFecha = aptDate.toDateString() === currentDate.toDateString();
        const coincideEstilista = filterEstilistaId ? apt.estilistaId === parseInt(filterEstilistaId) : true;
        return coincideFecha && coincideEstilista;
    }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const dayUnavailabilities = unavailabilities.filter(unav => {
        const unavDate = new Date(unav.fechaInicio);
        const coincideFecha = unavDate.toDateString() === currentDate.toDateString();
        const coincideEstilista = filterEstilistaId ? unav.estilistaId === parseInt(filterEstilistaId) : true;
        return coincideFecha && coincideEstilista;
    });

    return (
        <div className="view-card">
            <h2>Agenda del Día {filterEstilistaId && `- ${ESTILISTAS.find(e => e.id === parseInt(filterEstilistaId))?.nombre}`}</h2>
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
                                                allAppointments={appointments}
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