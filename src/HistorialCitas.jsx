import React, { useState, useMemo } from 'react';
import { ClipboardList } from 'lucide-react';
import { ESTILISTAS, TRATAMIENTOS } from './constants/salonData';

const hoy = () => new Date().toISOString().split('T')[0];

export default function HistorialCitas({ appointments, clients }) {
  const [filtroFecha, setFiltroFecha] = useState(hoy());

  const citasHistorial = useMemo(() => {
    let resultado = appointments.filter(a => a.pagado || a.cancelado);

    if (filtroFecha) {
      resultado = resultado.filter(a => {
        const fechaCita = new Date(a.fecha).toISOString().split('T')[0];
        return fechaCita === filtroFecha;
      });
    }

    return resultado
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
          estado: a.cancelado ? 'Cancelado' : 'Finalizado',
        };
      })
      .sort((a, b) => b.fechaInicio - a.fechaInicio);
  }, [appointments, clients, filtroFecha]);

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

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h2>
          <ClipboardList size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Historial de Citas
        </h2>
        <div className="historial-filtros">
          <label htmlFor="filtro-fecha-citas">Fecha:</label>
          <input
            id="filtro-fecha-citas"
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="historial-select"
          />
          <button
            type="button"
            onClick={() => setFiltroFecha('')}
            className="btn btn-secondary btn-sm"
          >
            Todos
          </button>
        </div>
      </div>

      <div className="historial-resumen">
        <span>{citasHistorial.length} cita{citasHistorial.length !== 1 ? 's' : ''}</span>
      </div>

      {citasHistorial.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} style={{ color: '#d1d5db', marginBottom: '1rem' }} />
          <p>No hay citas completadas para la fecha seleccionada.</p>
        </div>
      ) : (
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
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {citasHistorial.map(cita => (
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
                  <td>
                    <span className={`estado-badge ${cita.estado === 'Finalizado' ? 'estado-finalizado' : 'estado-cancelado'}`}>
                      {cita.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
