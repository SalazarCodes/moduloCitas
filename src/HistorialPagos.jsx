import React, { useState, useMemo } from 'react';
import { Receipt } from 'lucide-react';

const METODOS = ['Todos', 'Yape', 'Plin', 'Efectivo', 'Tarjeta', 'Transferencia'];

const BADGE_COLORS = {
  Yape: { bg: '#dcfce7', color: '#166534' },
  Plin: { bg: '#e0e7ff', color: '#3730a3' },
  Efectivo: { bg: '#fef9c3', color: '#854d0e' },
  Tarjeta: { bg: '#dbeafe', color: '#1e40af' },
  Transferencia: { bg: '#f3e8ff', color: '#6b21a8' },
};

const hoy = () => new Date().toISOString().split('T')[0];

export default function HistorialPagos({ pagos }) {
  const [filtroMetodo, setFiltroMetodo] = useState('Todos');
  const [filtroFecha, setFiltroFecha] = useState(hoy());

  const pagosFiltrados = useMemo(() => {
    let resultado = [...pagos];

    if (filtroFecha) {
      resultado = resultado.filter(p => {
        const fechaPago = new Date(p.fecha).toISOString().split('T')[0];
        return fechaPago === filtroFecha;
      });
    }

    if (filtroMetodo !== 'Todos') {
      resultado = resultado.filter(p => p.metodo === filtroMetodo);
    }

    resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return resultado;
  }, [pagos, filtroMetodo, filtroFecha]);

  const totalMonto = pagosFiltrados.reduce((sum, p) => sum + (p.montoTotal || 0), 0);

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h2><Receipt size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Historial de Pagos</h2>
        <div className="historial-filtros">
          <label htmlFor="filtro-fecha-pagos">Fecha:</label>
          <input
            id="filtro-fecha-pagos"
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
          <label htmlFor="filtro-metodo">Método:</label>
          <select
            id="filtro-metodo"
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value)}
            className="historial-select"
          >
            {METODOS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="historial-resumen">
        <span>{pagosFiltrados.length} pago{pagosFiltrados.length !== 1 ? 's' : ''}</span>
        <span className="historial-resumen-total">Total: S/. {totalMonto.toFixed(2)}</span>
      </div>

      {pagosFiltrados.length === 0 ? (
        <div className="empty-state">
          <Receipt size={48} style={{ color: '#d1d5db', marginBottom: '1rem' }} />
          <p>No hay pagos para la fecha seleccionada.</p>
        </div>
      ) : (
        <div className="historial-tabla-wrapper">
          <table className="historial-tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Servicios</th>
                <th>Monto</th>
                <th>Método de Pago</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map(pago => (
                <tr key={pago.id}>
                  <td>{formatFecha(pago.fecha)}</td>
                  <td>{pago.clienteNombre || 'Sin nombre'}</td>
                  <td>
                    {pago.items && pago.items.length > 0
                      ? pago.items.map(it => it.servicio).join(', ')
                      : '-'}
                  </td>
                  <td className="historial-monto">S/. {(pago.montoTotal || 0).toFixed(2)}</td>
                  <td>
                    <span
                      className="metodo-badge"
                      style={{
                        backgroundColor: (BADGE_COLORS[pago.metodo] || {}).bg || '#f3f4f6',
                        color: (BADGE_COLORS[pago.metodo] || {}).color || '#374151',
                      }}
                    >
                      {pago.metodo}
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
