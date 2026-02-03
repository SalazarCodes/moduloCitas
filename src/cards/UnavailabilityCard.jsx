import { Clock } from 'lucide-react';
import { ESTILISTAS } from '../constants/salonData';

export default function UnavailabilityCard({ unavailability, onClick, compact = false }) {
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