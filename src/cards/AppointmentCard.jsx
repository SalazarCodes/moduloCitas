import { Clock, CheckCircle } from 'lucide-react';
import { ESTILISTAS, TRATAMIENTOS } from '../constants/salonData';

export default function AppointmentCard({ appointment, onClick, compact = false, allAppointments = [] }) {
    const estilista = ESTILISTAS.find(e => e.id === appointment.estilistaId);
    const tratamiento = TRATAMIENTOS.find(t => t.id === appointment.tratamientoId);
    const client = JSON.parse(localStorage.getItem('salon_clients') || '[]').find(c => c.id === appointment.clienteId);

    // --- LÓGICA DE SESIONES ---
    let etiquetaSesion = "";

    // 1. Verificamos si el tratamiento tiene el flag activado y si hay citas para buscar
    if (tratamiento?.conteoSesiones && allAppointments.length > 0) {
        // 2. Filtramos todas las citas pasadas o futuras de ESTE cliente con ESTE tratamiento
        const historialCitas = allAppointments
            .filter(a =>
                a.clienteId === appointment.clienteId &&
                a.tratamientoId === appointment.tratamientoId
            )
            // 3. Ordenamos por fecha para saber el orden cronológico real
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        // 4. Buscamos en qué posición (índice) está la cita actual
        const indice = historialCitas.findIndex(a => a.id === appointment.id);

        // 5. Si la encontramos, el número de sesión es índice + 1
        if (indice !== -1) {
            etiquetaSesion = ` (Sesión ${indice + 1})`;
        }
    }
    // ---------------------------

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
                {estilista?.nombre}
                {appointment.pagado && (
                    <span className="pagado-badge">
                        <CheckCircle size={14} />
                        Pagado
                    </span>
                )}
            </div>
            {!compact && (
                <>
                    <div className="appointment-client">{client?.nombre}</div>
                    <div className="appointment-treatment">
                        {tratamiento?.nombre}
                        <span className="text-xs font-semibold text-gray-600">{etiquetaSesion}</span>
                    </div>
                    <div className="appointment-time">
                        <Clock size={14} />
                        {new Date(appointment.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {tratamiento?.duracion} min
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