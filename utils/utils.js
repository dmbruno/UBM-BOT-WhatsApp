import db from '../database.js';

// Obtener un usuario por teléfono
export const getUserByPhone = async (telefono) => {
    console.log("Buscando usuario con teléfono:", telefono); // Registro inicial
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM usuarios WHERE telefono = ?`,
            [telefono],
            (err, row) => {
                if (err) {
                    console.error("Error buscando usuario en getUserByPhone:", err.message);
                    return reject(err);
                }
                if (!row) {
                    console.log("Usuario no encontrado con el teléfono:", telefono); // Si no hay usuario
                } else {
                    console.log("Usuario encontrado:", row); // Si se encuentra el usuario
                }
                resolve(row || null);
            }
        );
    });
};

// Guardar un usuario
export const saveUser = async (telefono, nombre, correo) => {
    console.log("Datos recibidos en saveUser:", { telefono, nombre, correo });
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO usuarios (nombre, telefono, correo) VALUES (?, ?, ?)`,
            [nombre, telefono, correo],
            (err) => {
                if (err) {
                    console.error("Error guardando usuario:", err.message);
                    return reject(err);
                }
                resolve();
            }
        );
    });
};

// Guardar una consulta
export const saveConsulta = async (usuario_id, pasajeros, meses_disponibles, duracion, destino) => {
    console.log("Guardando consulta:", { usuario_id, pasajeros, meses_disponibles, duracion, destino });
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO consultas (usuario_id, pasajeros, meses_disponibles, duracion, destino) VALUES (?, ?, ?, ?, ?)`,
            [usuario_id, pasajeros, meses_disponibles, duracion, destino],
            (err) => {
                if (err) {
                    console.error("Error guardando consulta:", err.message);
                    return reject(err);
                }
                console.log("✅ Consulta guardada correctamente en la base de datos");
                resolve();
            }
        );
    });
};

// Función para enviar mensajes
export const sendMessage = async (sock, to, text) => {
    try {
        await sock.sendMessage(to, { text });
        console.log(`✅ Mensaje enviado a ${to.split('@')[0]}`);
    } catch (error) {
        console.error('❌ Error enviando mensaje:', error);
    }
};