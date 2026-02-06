import React, { useState, useMemo } from 'react';
import { Receipt, Printer } from 'lucide-react';

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

  const generarBoleta = (pago) => {
    const fechaPago = new Date(pago.fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const itemsHTML = (pago.items || []).map(item => `
      <div class="item">
        <div class="item-categoria">${item.categoria || 'General'}</div>
        <div class="item-nombre">${item.servicio}</div>
        <div class="item-precio">S/. ${(item.monto || 0).toFixed(2)}</div>
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Nota de Venta - MUSA</title>
        <style>
          @page {
            size: 58mm auto;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            width: 58mm;
            padding: 3mm;
            background: white;
            color: #000;
            font-weight: 500;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .logo {
            font-size: 18px;
            font-weight: 900;
            letter-spacing: 3px;
          }
          .subtitle {
            font-size: 9px;
            margin-top: 4px;
            color: #000;
            font-weight: 500;
          }
          .nota-tipo {
            font-size: 11px;
            font-weight: 700;
            margin-top: 6px;
            padding: 3px;
            border: 1px solid #000;
            display: inline-block;
          }
          .fecha {
            font-size: 9px;
            margin-top: 6px;
            color: #000;
            font-weight: 500;
          }
          .items {
            margin: 10px 0;
          }
          .item {
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 1px dotted #000;
          }
          .item:last-child {
            border-bottom: none;
          }
          .item-categoria {
            font-size: 8px;
            text-transform: uppercase;
            color: #000;
            letter-spacing: 0.5px;
            font-weight: 500;
          }
          .item-nombre {
            font-size: 10px;
            font-weight: 700;
            margin: 2px 0;
          }
          .item-precio {
            font-size: 10px;
            text-align: right;
            font-weight: 600;
          }
          .total-section {
            border-top: 1px dashed #000;
            padding-top: 8px;
            margin-top: 8px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: 900;
          }
          .metodo-pago {
            font-size: 9px;
            text-align: right;
            margin-top: 4px;
            color: #000;
            font-weight: 500;
          }
          .footer {
            text-align: center;
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px dashed #000;
            font-size: 9px;
            color: #000;
            font-weight: 500;
          }
          .no-valor {
            font-size: 8px;
            margin-top: 6px;
            color: #000;
            font-weight: 400;
          }
          @media print {
            body {
              width: 58mm;
            }
            .no-print {
              display: none;
            }
          }
          .btn-imprimir {
            display: block;
            width: 100%;
            margin-top: 15px;
            padding: 8px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 10px;
          }
          .btn-imprimir:hover {
            background: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">MUSA</div>
          <div class="subtitle">Centro de Belleza</div>
          <div class="nota-tipo">NOTA DE VENTA</div>
          <div class="fecha">${fechaPago}</div>
        </div>

        <div class="items">
          ${itemsHTML}
        </div>

        <div class="total-section">
          <div class="total-row">
            <span>TOTAL:</span>
            <span>S/. ${(pago.montoTotal || 0).toFixed(2)}</span>
          </div>
          <div class="metodo-pago">
            Método de pago: ${pago.metodo}
          </div>
        </div>

        <div class="footer">
          <div>Gracias por su preferencia</div>
          <div class="no-valor">DOCUMENTO SIN VALOR FISCAL</div>
        </div>

        <button class="btn-imprimir no-print" onclick="window.print()">
          Imprimir
        </button>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank', 'width=250,height=400');
    ventana.document.write(html);
    ventana.document.close();
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
                <th>Boleta</th>
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
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => generarBoleta(pago)}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: '#6366f1',
                        color: 'white',
                        padding: '6px 10px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Generar boleta"
                    >
                      <Printer size={14} />
                    </button>
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
