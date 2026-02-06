import React from 'react';
import { Calendar, Receipt, ClipboardList, Wallet } from 'lucide-react';

export default function Sidebar({ moduloActivo, onCambiarModulo }) {
  const items = [
    { id: 'citas', label: 'Citas', icon: Calendar },
    { id: 'historialCitas', label: 'Historial de Citas', icon: ClipboardList },
    { id: 'historial', label: 'Historial de Pagos', icon: Receipt },
    { id: 'gastos', label: 'Historial de Gastos', icon: Wallet },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/images/logo.png" alt="Musa Logo" className="sidebar-logo-img" />
        <span className="sidebar-title">Musa</span>
      </div>
      <nav className="sidebar-nav">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`sidebar-item ${moduloActivo === item.id ? 'active' : ''}`}
              onClick={() => onCambiarModulo(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
