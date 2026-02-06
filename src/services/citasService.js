import { supabase } from '../supabaseClient';

const USAR_SUPABASE = true;

const KEYS = {
    CITAS: 'salon_appointments',
    CLIENTES: 'salon_clients',
    AUSENCIAS: 'salon_unavailabilities',
    PAGOS: 'salon_payments'
};

// Función auxiliar para encontrar un valor sin importar si la clave está en mayúscula o minúscula
const getValorSeguro = (obj, key) => {
    if (!obj) return null;
    // Busca la clave exacta, O la clave en minúsculas, O la clave común de DB
    return obj[key] || obj[key.toLowerCase()] || obj[key.toLowerCase().replace('id', '_id')];
};

// ==========================================
// 1. GESTIÓN DE CITAS
// ==========================================

export const obtenerCitas = async () => {
    if (USAR_SUPABASE) {
        const { data, error } = await supabase
            .from('citas')
            .select('*');
        if (error) throw error;

        // TRADUCCIÓN HÍBRIDA (Busca mayúsculas O minúsculas)
        return data.map(c => {
            // Parsear tratamientos si viene como string JSON
            let tratamientos = c.tratamientos;
            if (typeof tratamientos === 'string') {
                try {
                    tratamientos = JSON.parse(tratamientos);
                } catch (e) {
                    tratamientos = null;
                }
            }

            return {
                ...c,
                clienteId: getValorSeguro(c, 'clienteId'),
                estilistaId: getValorSeguro(c, 'estilistaId'),
                tratamientoId: getValorSeguro(c, 'tratamientoId'),
                pagado: c.pagado || false,
                cancelado: c.cancelado || false,
                tratamientos: tratamientos,
                categoriaSeleccionada: '' // Reiniciamos esto para el front
            };
        });
    } else {
        return JSON.parse(localStorage.getItem(KEYS.CITAS) || '[]');
    }
};

export const guardarCita = async (cita) => {
    if (USAR_SUPABASE) {
        // Leemos el valor de donde sea que venga (del state de React o de una edición previa)
        const clienteId = getValorSeguro(cita, 'clienteId');
        const estilistaId = getValorSeguro(cita, 'estilistaId');
        const tratamientoId = getValorSeguro(cita, 'tratamientoId');

        // Validación de seguridad: Si faltan IDs, lanzamos error antes de enviar
        if (!clienteId || !estilistaId || !tratamientoId) {
            console.error("Datos incompletos:", cita);
            // No lanzamos error fatal para no romper la app, pero avisamos en consola
        }

        // Preparamos el objeto para Supabase (Minúsculas para asegurar compatibilidad)
        // Nota: Si tu columna en Supabase se llama "clienteId" (con comillas), esto podría requerir ajuste,
        // pero usualmente Postgre acepta enviar todo minúscula si no se usan comillas.
        const citaParaBD = {
            clienteid: parseInt(clienteId),
            estilistaid: parseInt(estilistaId),
            tratamientoid: parseInt(tratamientoId),
            fecha: new Date(cita.fecha).toISOString(),
            notas: cita.notas || '',
            duracion: parseInt(cita.duracion || 0),
            pagado: cita.pagado || false,
            cancelado: cita.cancelado || false,
            // Multi-tratamiento: guardar como JSONB si existe
            tratamientos: cita.tratamientos ? JSON.stringify(cita.tratamientos) : null
        };

        // Lógica de ID (Evitar timestamps gigantes)
        const esIdTemporal = cita.id && cita.id > 2000000000;
        if (cita.id && !esIdTemporal) {
            citaParaBD.id = cita.id;
        }

        console.log("Payload final enviado a Supabase:", citaParaBD);

        const { data, error } = await supabase
            .from('citas')
            .upsert([citaParaBD])
            .select();

        if (error) throw error;

        // Traducir respuesta de vuelta
        const guardada = data[0];

        // Parsear tratamientos si viene como string
        let tratamientos = guardada.tratamientos;
        if (typeof tratamientos === 'string') {
            try {
                tratamientos = JSON.parse(tratamientos);
            } catch (e) {
                tratamientos = null;
            }
        }

        return {
            ...guardada,
            clienteId: getValorSeguro(guardada, 'clienteId'),
            estilistaId: getValorSeguro(guardada, 'estilistaId'),
            tratamientoId: getValorSeguro(guardada, 'tratamientoId'),
            tratamientos: tratamientos
        };

    } else {
        // MODO LOCAL (Sin cambios)
        const citas = JSON.parse(localStorage.getItem(KEYS.CITAS) || '[]');
        const citaAGuardar = { ...cita };
        const index = citas.findIndex(c => c.id === citaAGuardar.id);
        if (index >= 0) {
            citas[index] = citaAGuardar;
        } else {
            if (!citaAGuardar.id) citaAGuardar.id = Date.now();
            citas.push(citaAGuardar);
        }
        localStorage.setItem(KEYS.CITAS, JSON.stringify(citas));
        return citaAGuardar;
    }
};

export const eliminarCita = async (id) => {
    if (USAR_SUPABASE) {
        const { error } = await supabase.from('citas').delete().eq('id', id);
        if (error) throw error;
    } else {
        const citas = JSON.parse(localStorage.getItem(KEYS.CITAS) || '[]');
        const nuevasCitas = citas.filter(c => c.id !== id);
        localStorage.setItem(KEYS.CITAS, JSON.stringify(nuevasCitas));
    }
};

export const cancelarCita = async (id) => {
    if (USAR_SUPABASE) {
        const { error } = await supabase
            .from('citas')
            .update({ cancelado: true })
            .eq('id', id);
        if (error) throw error;
    } else {
        const citas = JSON.parse(localStorage.getItem(KEYS.CITAS) || '[]');
        const citasActualizadas = citas.map(c =>
            c.id === id ? { ...c, cancelado: true } : c
        );
        localStorage.setItem(KEYS.CITAS, JSON.stringify(citasActualizadas));
    }
};

// ==========================================
// 2. GESTIÓN DE CLIENTES
// ==========================================

export const obtenerClientes = async () => {
    if (USAR_SUPABASE) {
        const { data, error } = await supabase.from('clientes').select('*');
        if (error) throw error;
        return data;
    } else {
        return JSON.parse(localStorage.getItem(KEYS.CLIENTES) || '[]');
    }
};

export const guardarCliente = async (cliente) => {
    if (USAR_SUPABASE) {
        const clienteBD = {
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email,
            notas: cliente.notas
        };
        if (cliente.id) clienteBD.id = cliente.id;

        const { data, error } = await supabase.from('clientes').upsert([clienteBD]).select();
        if (error) throw error;
        return data[0];
    } else {
        const clientes = JSON.parse(localStorage.getItem(KEYS.CLIENTES) || '[]');
        const index = clientes.findIndex(c => c.id === cliente.id);
        if (index >= 0) clientes[index] = cliente;
        else {
            if (!cliente.id) cliente.id = Date.now();
            clientes.push(cliente);
        }
        localStorage.setItem(KEYS.CLIENTES, JSON.stringify(clientes));
        return cliente;
    }
};

export const eliminarCliente = async (id) => {
    if (USAR_SUPABASE) {
        const { error } = await supabase.from('clientes').delete().eq('id', id);
        if (error) throw error;
    } else {
        const clientes = JSON.parse(localStorage.getItem(KEYS.CLIENTES) || '[]');
        const nuevosClientes = clientes.filter(c => c.id !== id);
        localStorage.setItem(KEYS.CLIENTES, JSON.stringify(nuevosClientes));
    }
};

// ==========================================
// 3. GESTIÓN DE AUSENCIAS
// ==========================================

export const obtenerAusencias = async () => {
    if (USAR_SUPABASE) {
        const { data, error } = await supabase.from('ausencias').select('*');
        if (error) throw error;

        return data.map(a => ({
            ...a,
            estilistaId: getValorSeguro(a, 'estilistaId'),
            fechaInicio: getValorSeguro(a, 'fechaInicio'),
            fechaFin: getValorSeguro(a, 'fechaFin')
        }));
    } else {
        return JSON.parse(localStorage.getItem(KEYS.AUSENCIAS) || '[]');
    }
};

export const guardarAusencia = async (ausencia) => {
    if (USAR_SUPABASE) {
        const estilistaId = getValorSeguro(ausencia, 'estilistaId');
        const fInicio = getValorSeguro(ausencia, 'fechaInicio');
        const fFin = getValorSeguro(ausencia, 'fechaFin');

        const ausenciaBD = {
            estilistaid: parseInt(estilistaId),
            fechainicio: new Date(fInicio).toISOString(),
            fechafin: new Date(fFin).toISOString(),
            motivo: ausencia.motivo
        };

        const esIdTemporal = ausencia.id && ausencia.id > 2000000000;
        if (ausencia.id && !esIdTemporal) {
            ausenciaBD.id = ausencia.id;
        }

        const { data, error } = await supabase.from('ausencias').upsert([ausenciaBD]).select();
        if (error) throw error;

        const guardada = data[0];
        return {
            ...guardada,
            estilistaId: getValorSeguro(guardada, 'estilistaId'),
            fechaInicio: getValorSeguro(guardada, 'fechaInicio'),
            fechaFin: getValorSeguro(guardada, 'fechaFin')
        };
    } else {
        const ausencias = JSON.parse(localStorage.getItem(KEYS.AUSENCIAS) || '[]');
        const index = ausencias.findIndex(a => a.id === ausencia.id);
        if (index >= 0) ausencias[index] = ausencia;
        else {
            if (!ausencia.id) ausencia.id = Date.now();
            ausencias.push(ausencia);
        }
        localStorage.setItem(KEYS.AUSENCIAS, JSON.stringify(ausencias));
        return ausencia;
    }
};

export const eliminarAusencia = async (id) => {
    if (USAR_SUPABASE) {
        const { error } = await supabase.from('ausencias').delete().eq('id', id);
        if (error) throw error;
    } else {
        const ausencias = JSON.parse(localStorage.getItem(KEYS.AUSENCIAS) || '[]');
        const nuevasAusencias = ausencias.filter(a => a.id !== id);
        localStorage.setItem(KEYS.AUSENCIAS, JSON.stringify(nuevasAusencias));
    }
};

// ==========================================
// 4. GESTIÓN DE PAGOS
// ==========================================

export const obtenerPagos = async () => {
    if (USAR_SUPABASE) {
        const { data, error } = await supabase
            .from('pagos')
            .select('*');
        if (error) throw error;

        return data.map(p => {
            const detalles = typeof p.detalles === 'string' ? JSON.parse(p.detalles) : (p.detalles || {});
            return {
                id: p.id,
                montoTotal: p.monto,
                metodo: p.metodo_pago,
                fecha: p.fecha_pago,
                citaIds: detalles.citaIds || [],
                items: detalles.items || [],
                clienteNombre: detalles.clienteNombre || 'Sin nombre'
            };
        });
    } else {
        return JSON.parse(localStorage.getItem(KEYS.PAGOS) || '[]');
    }
};

export const registrarPago = async (pago) => {
    if (USAR_SUPABASE) {
        const { data, error } = await supabase
            .from('pagos')
            .insert([{
                monto: pago.montoTotal,
                metodo_pago: pago.metodo,
                fecha_pago: pago.fecha,
                detalles: JSON.stringify({
                    citaIds: pago.citaIds,
                    items: pago.items,
                    clienteNombre: pago.clienteNombre
                })
            }]);
        if (error) throw error;
        return data;
    } else {
        const pagos = JSON.parse(localStorage.getItem(KEYS.PAGOS) || '[]');
        const nuevoPago = { ...pago, id: Date.now() };
        pagos.push(nuevoPago);
        localStorage.setItem(KEYS.PAGOS, JSON.stringify(pagos));
        return nuevoPago;
    }
};

// Marcar múltiples citas como pagadas
export const marcarCitasPagadas = async (citaIds) => {
    if (USAR_SUPABASE) {
        const { error } = await supabase
            .from('citas')
            .update({ pagado: true })
            .in('id', citaIds);
        if (error) throw error;
    } else {
        const citas = JSON.parse(localStorage.getItem(KEYS.CITAS) || '[]');
        const citasActualizadas = citas.map(c =>
            citaIds.includes(c.id) ? { ...c, pagado: true } : c
        );
        localStorage.setItem(KEYS.CITAS, JSON.stringify(citasActualizadas));
    }
};

// ==========================================
// 5. GESTION DE GASTOS
// ==========================================

const GASTOS_KEY = 'salon_gastos';

export const obtenerGastos = async () => {
    if (USAR_SUPABASE) {
        const { data, error } = await supabase
            .from('gastos')
            .select('*');
        if (error) throw error;

        return data.map(g => ({
            ...g,
            encargadaId: g.encargadaid || g.encargadaId
        }));
    } else {
        return JSON.parse(localStorage.getItem(GASTOS_KEY) || '[]');
    }
};

export const guardarGasto = async (gasto) => {
    if (USAR_SUPABASE) {
        const gastoBD = {
            encargadaid: parseInt(gasto.encargadaId),
            descripcion: gasto.descripcion,
            monto: parseFloat(gasto.monto),
            fecha: new Date(gasto.fecha).toISOString()
        };

        const esIdTemporal = gasto.id && gasto.id > 2000000000;
        if (gasto.id && !esIdTemporal) {
            gastoBD.id = gasto.id;
        }

        const { data, error } = await supabase
            .from('gastos')
            .upsert([gastoBD])
            .select();
        if (error) throw error;

        const guardado = data[0];
        return {
            ...guardado,
            encargadaId: guardado.encargadaid || guardado.encargadaId
        };
    } else {
        const gastos = JSON.parse(localStorage.getItem(GASTOS_KEY) || '[]');
        const index = gastos.findIndex(g => g.id === gasto.id);
        if (index >= 0) {
            gastos[index] = gasto;
        } else {
            if (!gasto.id) gasto.id = Date.now();
            gastos.push(gasto);
        }
        localStorage.setItem(GASTOS_KEY, JSON.stringify(gastos));
        return gasto;
    }
};

export const eliminarGasto = async (id) => {
    if (USAR_SUPABASE) {
        const { error } = await supabase.from('gastos').delete().eq('id', id);
        if (error) throw error;
    } else {
        const gastos = JSON.parse(localStorage.getItem(GASTOS_KEY) || '[]');
        const nuevosGastos = gastos.filter(g => g.id !== id);
        localStorage.setItem(GASTOS_KEY, JSON.stringify(nuevosGastos));
    }
};