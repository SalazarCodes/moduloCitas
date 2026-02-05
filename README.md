# MUSA - Sistema de Gestión de Citas para Salón de Belleza

Sistema web para la gestión integral de citas, clientes y pagos de un centro de belleza. Desarrollado con React y Supabase.

## Descripción

MUSA es una aplicación diseñada para facilitar la administración diaria de un salón de belleza, permitiendo gestionar citas, clientes, estilistas, tratamientos y pagos de forma eficiente.

## Módulos del Sistema

### 1. Calendario de Citas
- **Vista Día**: Muestra las citas del día organizadas por hora
- **Vista Semana**: Visualización de 7 días con todas las citas
- **Vista Mes**: Calendario mensual con resumen de citas por día
- Filtrado por estilista
- Código de colores por estilista para fácil identificación

### 2. Gestión de Citas
- Crear, editar y cancelar citas
- Soporte para **multi-tratamiento**: una cita puede incluir múltiples servicios con diferentes estilistas
- Asignación de cliente, estilista, categoría y tratamiento
- Notas adicionales por cita
- Indicadores visuales de estado (pagado, cancelado)
- Conteo automático de sesiones para tratamientos recurrentes

### 3. Gestión de Clientes
- Registro de clientes con nombre, teléfono y DNI
- Creación rápida de clientes desde el modal de citas
- Edición y eliminación de clientes

### 4. Gestión de Ausencias
- Registro de indisponibilidad de estilistas
- Visualización de ausencias en el calendario

### 5. Sistema de Cobros
- Registro de pagos con múltiples métodos (Yape, Plin, Efectivo, Tarjeta, Transferencia)
- Soporte para cobrar múltiples servicios en una sola transacción
- Generación de **Nota de Venta** en formato de papel térmico (58mm)
- Detalle de servicios con precios individuales

### 6. Historial de Pagos
- Registro completo de todos los pagos realizados
- Filtrado por fecha
- Detalle de servicios cobrados por transacción

### 7. Historial de Citas
- Visualización de citas finalizadas y canceladas
- Filtrado por fecha
- Estado de cada cita (Finalizado/Cancelado)

## Tecnologías

- **Frontend**: React 18
- **Base de datos**: Supabase (PostgreSQL)
- **Estilos**: CSS personalizado
- **Iconos**: Lucide React
- **Despliegue**: Vercel

## Configuración

### Variables de entorno

Crear un archivo `.env` con las credenciales de Supabase:

```
REACT_APP_SUPABASE_URL=tu_url_de_supabase
REACT_APP_SUPABASE_ANON_KEY=tu_anon_key
```

### Instalación

```bash
npm install
```

### Desarrollo local

```bash
npm start
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### Producción

```bash
npm run build
```

## Estructura de la Base de Datos

### Tablas en Supabase

- **clientes**: id, nombre, telefono, email, notas
- **citas**: id, clienteid, estilistaid, tratamientoid, fecha, duracion, notas, pagado, cancelado, tratamientos (jsonb)
- **ausencias**: id, estilistaid, fechainicio, fechafin, motivo
- **pagos**: id, monto, metodo_pago, fecha_pago, detalles (jsonb)

## Respaldos

El sistema incluye:
- Exportación manual de datos en formato JSON
- Importación de respaldos
- Recordatorio automático si no se ha hecho backup en 7 días

## Licencia

Proyecto privado - MUSA Centro de Belleza
