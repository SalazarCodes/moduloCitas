import { supabase } from '../supabaseClient';

// ==========================================
// CONFIGURACIÓN
// ==========================================
// Cambia a TRUE cuando tengas tu tabla creada en Supabase
const USAR_SUPABASE = true;

// Claves para LocalStorage (solo se usan si USAR_SUPABASE es false)
const KEYS = {
    CITAS: 'salon_appointments',
    CLIENTES: 'salon_clients',
    AUSENCIAS: 'salon_unavailabilities'
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
        return data.map(c => ({
            ...c,
            clienteId: c.clienteid,
            estilistaId: c.estilistaid,
            tratamientoId: c.tratamientoid
        }));
    } else {
        // Modo Local: Simulamos retardo de red
        return JSON.parse(localStorage.getItem(KEYS.CITAS) || '[]');
    }
};

// En src/services/citasService.js

export const guardarCita = async (cita) => {
    if (USAR_SUPABASE) {
        const citaParaBD = {
            clienteid: parseInt(cita.clienteid),
            estilistaid: parseInt(cita.estilistaid),
            tratamientoid: parseInt(cita.tratamientoid),
            fecha: new Date(cita.fecha).toISOString(),
            notas: cita.notas || '',
            duracion: parseInt(cita.duracion)
        };

        // --- CAMBIO CLAVE AQUÍ ---
        // Solo pasamos el ID si es un ID real de base de datos (número pequeño).
        // Si es un ID temporal (timestamp gigante generado por Date.now()), lo ignoramos
        // para que Supabase genere uno nuevo limpio (1, 2, 3...).

        const esIdTemporal = cita.id && cita.id > 2000000000; // Un timestamp siempre es mayor a 2 mil millones

        if (cita.id && !esIdTemporal) {
            citaParaBD.id = cita.id;
        }
        // -------------------------

        console.log("Enviando a Supabase (sin ID temporal):", citaParaBD);

        const { data, error } = await supabase
            .from('citas')
            .upsert([citaParaBD])
            .select();

        if (error) throw error;
        const citaGuardada = data[0];
        return {
            ...citaGuardada,
            clienteId: citaGuardada.clienteid,
            estilistaId: citaGuardada.estilistaid,
            tratamientoId: citaGuardada.tratamientoid
        };

    } else {
        // (El código de LocalStorage se queda igual...)
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
        const { error } = await supabase
            .from('citas')
            .delete()
            .eq('id', id);
        if (error) throw error;
    } else {
        const citas = JSON.parse(localStorage.getItem(KEYS.CITAS) || '[]');
        const nuevasCitas = citas.filter(c => c.id !== id);
        localStorage.setItem(KEYS.CITAS, JSON.stringify(nuevasCitas));
    }
};

// ==========================================
// 2. GESTIÓN DE CLIENTES
// ==========================================
// (Clientes suele usar nombres simples como nombre, telefono, email, 
// así que probablemente no necesita traducción, pero por seguridad revisamos)

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
        // Aseguramos que no vaya ningún campo raro
        const clienteBD = {
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email, // Recuerda que este es tu campo DNI
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

        // TRADUCCIÓN TAMBIÉN AQUÍ
        return data.map(a => ({
            ...a,
            estilistaId: a.estilistaid,     // Traducción
            fechaInicio: a.fechainicio,     // Ojo con esto, Supabase suele devolver todo minúscula
            fechaFin: a.fechafin            // Si creaste 'fechaInicio' en supabase, checa si te lo devuelve 'fechainicio'
        }));
    } else {
        return JSON.parse(localStorage.getItem(KEYS.AUSENCIAS) || '[]');
    }
};

export const guardarAusencia = async (ausencia) => {
    if (USAR_SUPABASE) {
        const ausenciaBD = {
            estilistaid: parseInt(ausencia.estilistaId),
            fechainicio: new Date(ausencia.fechaInicio).toISOString(),
            fechafin: new Date(ausencia.fechaFin).toISOString(),
            motivo: ausencia.motivo
        };

        const esIdTemporal = ausencia.id && ausencia.id > 2000000000;
        if (ausencia.id && !esIdTemporal) {
            ausenciaBD.id = ausencia.id;
        }

        const { data, error } = await supabase.from('ausencias').upsert([ausenciaBD]).select();
        if (error) throw error;

        // Traducir respuesta
        const guardada = data[0];
        return {
            ...guardada,
            estilistaId: guardada.estilistaid,
            fechaInicio: guardada.fechainicio,
            fechaFin: guardada.fechafin
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