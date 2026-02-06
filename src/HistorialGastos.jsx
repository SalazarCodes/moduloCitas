import React, { useState, useMemo } from 'react';
import { Wallet, Plus } from 'lucide-react';
import { ESTILISTAS } from './constants/salonData';
import GastoModal from './modals/GastoModal';

const hoy = () => new Date().toISOString().split('T')[0];

export default function HistorialGastos({ gastos, onSaveGasto, onDeleteGasto }) {
  const [filtroFecha, setFiltroFecha] = useState(hoy());
  const [showModal, setShowModal] = useState(false);
  const [editingGasto, setEditingGasto] = useState(null);

  const gastosFiltrados = useMemo(() => {
    let resultado = [...gastos];

    if (filtroFecha) {
      resultado = resultado.filter(g => {
        const fechaGasto = new Date(g.fecha).toISOString().split('T')[0];
        return fechaGasto === filtroFecha;
      });
    }

    return resultado
      .map(g => {
        const encargada = ESTILISTAS.find(e => e.id === g.encargadaId);
        return {
          ...g,
          encargadaNombre: encargada?.nombre || 'Sin asignar',
          encargadaColor: encargada?.color || '#6b7280',
          fechaFormateada: new Date(g.fecha)
        };
      })
      .sort((a, b) => b.fechaFormateada - a.fechaFormateada);
  }, [gastos, filtroFecha]);

  const totalGastos = gastosFiltrados.reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);

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

  const handleNuevoGasto = () => {
    setEditingGasto(null);
    setShowModal(true);
  };

  const handleEditGasto = (gasto) => {
    setEditingGasto(gasto);
    setShowModal(true);
  };

  const handleSave = async (gastoData) => {
    await onSaveGasto(gastoData);
    setShowModal(false);
    setEditingGasto(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este gasto?')) {
      await onDeleteGasto(id);
      setShowModal(false);
      setEditingGasto(null);
    }
  };

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h2>
          <Wallet size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Historial de Gastos
        </h2>
        <div className="historial-filtros">
          <label htmlFor="filtro-fecha-gastos">Fecha:</label>
          <input
            id="filtro-fecha-gastos"
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
          <button
            type="button"
            onClick={handleNuevoGasto}
            className="btn btn-primary"
            style={{ marginLeft: '1rem' }}
          >
            <Plus size={16} />
            Agregar Gasto
          </button>
        </div>
      </div>

      <div className="historial-resumen">
        <span>{gastosFiltrados.length} gasto{gastosFiltrados.length !== 1 ? 's' : ''}</span>
        <span className="historial-resumen-total">Total: S/. {totalGastos.toFixed(2)}</span>
      </div>

      {gastosFiltrados.length === 0 ? (
        <div className="empty-state">
          <Wallet size={48} style={{ color: '#d1d5db', marginBottom: '1rem' }} />
          <p>No hay gastos registrados para la fecha seleccionada.</p>
        </div>
      ) : (
        <div className="historial-tabla-wrapper">
          <table className="historial-tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Encargada</th>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {gastosFiltrados.map(gasto => (
                <tr
                  key={gasto.id}
                  onClick={() => handleEditGasto(gasto)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{formatFecha(gasto.fechaFormateada)}</td>
                  <td>{formatHora(gasto.fechaFormateada)}</td>
                  <td>
                    <span
                      className="estilista-badge"
                      style={{
                        backgroundColor: gasto.encargadaColor + '20',
                        color: gasto.encargadaColor,
                        borderLeft: `3px solid ${gasto.encargadaColor}`,
                      }}
                    >
                      {gasto.encargadaNombre}
                    </span>
                  </td>
                  <td>{gasto.descripcion}</td>
                  <td className="historial-monto">S/. {parseFloat(gasto.monto).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <GastoModal
          gasto={editingGasto}
          onClose={() => {
            setShowModal(false);
            setEditingGasto(null);
          }}
          onSave={handleSave}
          onDelete={editingGasto ? handleDelete : null}
        />
      )}
    </div>
  );
}
