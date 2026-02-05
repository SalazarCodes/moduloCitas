import AppointmentCard from '../cards/AppointmentCard';
import UnavailabilityCard from '../cards/UnavailabilityCard';

export default function WeekView({ currentDate, appointments, unavailabilities, filterEstilistaId, setEditingAppointment, setEditingUnavailability, setShowModal, setShowUnavailabilityModal, clients = [] }) {
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
                        if (apt.cancelado) return false; // Ocultar citas canceladas
                        const aptDate = new Date(apt.fecha);
                        const coincideFecha = aptDate.toDateString() === day.toDateString();
                        const coincideEstilista = filterEstilistaId ? apt.estilistaId === parseInt(filterEstilistaId) : true;
                        return coincideFecha && coincideEstilista;
                    }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

                    const dayUnavailabilities = unavailabilities.filter(unav => {
                        const unavDate = new Date(unav.fechaInicio);
                        const coincideFecha = unavDate.toDateString() === day.toDateString();
                        const coincideEstilista = filterEstilistaId ? unav.estilistaId === parseInt(filterEstilistaId) : true;
                        return coincideFecha && coincideEstilista;
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
                                        <AppointmentCard appointment={apt} compact allAppointments={appointments} clients={clients} />
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