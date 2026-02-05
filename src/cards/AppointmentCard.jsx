import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { ESTILISTAS, TRATAMIENTOS } from '../constants/salonData';

export default function AppointmentCard({ appointment, onClick, compact = false, allAppointments = [], clients = [] }) {
    const estilista = ESTILISTAS.find(e => e.id === appointment.estilistaId);
    const tratamiento = TRATAMIENTOS.find(t => t.id === appointment.tratamientoId);
    const client = clients.find(c => c.id === appointment.clienteId);

    // Multi-tratamiento: si existe el array con >1 items
    const esMulti = appointment.tratamientos && appointment.tratamientos.length > 1;

    // --- LÓGICA DE SESIONES ---
    let etiquetaSesion = "";

    // Solo aplica para citas de un solo tratamiento
    if (!esMulti && tratamiento?.conteoSesiones && allAppointments.length > 0) {
        const historialCitas = allAppointments
            .filter(a =>
                a.clienteId === appointment.clienteId &&
                a.tratamientoId === appointment.tratamientoId
            )
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        const indice = historialCitas.findIndex(a => a.id === appointment.id);

        if (indice !== -1) {
            etiquetaSesion = ` (Sesión ${indice + 1})`;
        }
    }
    // ---------------------------

    // Duración a mostrar: usar appointment.duracion si existe (viene sumada en multi), sino del tratamiento
    const duracionMostrar = appointment.duracion || tratamiento?.duracion || 0;

    return (
        <div
            onClick={onClick}
            className={`appointment-card ${appointment.pagado ? 'appointment-pagado' : ''}`}
            style={{
                backgroundColor: estilista?.color + '20',
                borderLeft: `4px solid ${estilista?.color}`
            }}
        >
            <div className="appointment-estilista" style={{ color: estilista?.color }}>
                {client?.nombre || 'Sin cliente'}
                {appointment.pagado && (
                    <span className="pagado-badge">
                        <CheckCircle size={14} />
                        Pagado
                    </span>
                )}
                {appointment.cancelado && (
                    <span className="cancelado-badge">
                        <XCircle size={14} />
                        Cancelado
                    </span>
                )}
            </div>
            {!compact && (
                <>
                    {esMulti ? (
                        <div className="appointment-treatment">
                            {appointment.tratamientos.map((t, i) => {
                                const trat = TRATAMIENTOS.find(tr => tr.id === t.tratamientoId);
                                const est = ESTILISTAS.find(e => e.id === t.estilistaId);
                                return (
                                    <div key={i} className="appointment-multi-line">
                                        {trat?.nombre || 'Servicio'} - {est?.nombre || 'Sin asignar'}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="appointment-treatment">
                            {tratamiento?.nombre} - {estilista?.nombre}
                            <span className="text-xs font-semibold text-gray-600">{etiquetaSesion}</span>
                        </div>
                    )}
                    <div className="appointment-time">
                        <Clock size={14} />
                        {new Date(appointment.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {duracionMostrar} min
                    </div>
                </>
            )}
            {compact && (
                <>
                    <div className="appointment-time-compact" style={{ color: estilista?.color }}>
                        {new Date(appointment.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {appointment.pagado && (
                        <span className="pagado-badge compact">
                            <CheckCircle size={12} />
                        </span>
                    )}
                </>
            )}
        </div>
    );
}
