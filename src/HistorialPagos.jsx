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

export default function HistorialPagos({ pagos }) {
  const [filtroMetodo, setFiltroMetodo] = useState('Todos');

  const pagosFiltrados = useMemo(() => {
    let resultado = [...pagos];

    if (filtroMetodo !== 'Todos') {
      resultado = resultado.filter(p => p.metodo === filtroMetodo);
    }

    resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return resultado;
  }, [pagos, filtroMetodo]);

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

  if (pagos.length === 0) {
    return (
      <div className="historial-container">
        <div className="historial-header">
          <h2><Receipt size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Historial de Pagos</h2>
        </div>
        <div className="empty-state">
          <Receipt size={48} style={{ color: '#d1d5db', marginBottom: '1rem' }} />
          <p>No hay pagos registrados aún.</p>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Los pagos aparecerán aquí cuando se registren desde las citas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h2><Receipt size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Historial de Pagos</h2>
        <div className="historial-filtros">
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
    </div>
  );
}
