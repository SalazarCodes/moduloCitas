import React, { useMemo } from 'react';
import { ClipboardList } from 'lucide-react';
import { ESTILISTAS, TRATAMIENTOS } from './constants/salonData';

export default function HistorialCitas({ appointments, clients }) {
  const citasPagadas = useMemo(() => {
    return appointments
      .filter(a => a.pagado)
      .map(a => {
        const cliente = clients.find(c => c.id === a.clienteId);
        const estilista = ESTILISTAS.find(e => e.id === a.estilistaId);
        const tratamiento = TRATAMIENTOS.find(t => t.id === parseInt(a.tratamientoId));

        const fechaInicio = new Date(a.fecha);
        const duracion = tratamiento?.duracion || a.duracion || 0;
        const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);

        return {
          id: a.id,
          clienteNombre: cliente?.nombre || 'Sin nombre',
          estilistaNombre: estilista?.nombre || 'Sin asignar',
          estilistaColor: estilista?.color || '#6b7280',
          tratamientoNombre: tratamiento?.nombre || 'Servicio general',
          fechaInicio,
          fechaFin,
          duracion,
        };
      })
      .sort((a, b) => b.fechaInicio - a.fechaInicio);
  }, [appointments, clients]);

  const formatFecha = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatHora = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (citasPagadas.length === 0) {
    return (
      <div className="historial-container">
        <div className="historial-header">
          <h2>
            <ClipboardList size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Historial de Citas
          </h2>
        </div>
        <div className="empty-state">
          <ClipboardList size={48} style={{ color: '#d1d5db', marginBottom: '1rem' }} />
          <p>No hay citas completadas aún.</p>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            Las citas aparecerán aquí cuando se registre su pago.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h2>
          <ClipboardList size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Historial de Citas
        </h2>
      </div>

      <div className="historial-resumen">
        <span>{citasPagadas.length} cita{citasPagadas.length !== 1 ? 's' : ''} completada{citasPagadas.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="historial-tabla-wrapper">
        <table className="historial-tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Procedimiento</th>
              <th>Estilista</th>
              <th>Hora Inicio</th>
              <th>Hora Fin</th>
            </tr>
          </thead>
          <tbody>
            {citasPagadas.map(cita => (
              <tr key={cita.id}>
                <td>{formatFecha(cita.fechaInicio)}</td>
                <td>{cita.clienteNombre}</td>
                <td>{cita.tratamientoNombre}</td>
                <td>
                  <span
                    className="estilista-badge"
                    style={{
                      backgroundColor: cita.estilistaColor + '20',
                      color: cita.estilistaColor,
                      borderLeft: `3px solid ${cita.estilistaColor}`,
                    }}
                  >
                    {cita.estilistaNombre}
                  </span>
                </td>
                <td>{formatHora(cita.fechaInicio)}</td>
                <td>{formatHora(cita.fechaFin)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
