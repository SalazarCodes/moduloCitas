import { HORARIO_INICIO, HORARIO_FIN, ESTILISTAS } from '../constants/salonData';

export default function MonthView({ currentDate, appointments, unavailabilities, filterEstilistaId, setEditingAppointment, setEditingUnavailability, setShowModal, setShowUnavailabilityModal }) {
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
                            const coincideFecha = aptDate.toDateString() === day.toDateString();
                            const coincideEstilista = filterEstilistaId ? apt.estilistaId === parseInt(filterEstilistaId) : true;
                            return coincideFecha && coincideEstilista;
                        });

                        const dayUnavailabilities = unavailabilities.filter(unav => {
                            const unavDate = new Date(unav.fechaInicio);
                            const coincideFecha = unavDate.toDateString() === day.toDateString();
                            const coincideEstilista = filterEstilistaId ? unav.estilistaId === parseInt(filterEstilistaId) : true;
                            return coincideFecha && coincideEstilista;
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