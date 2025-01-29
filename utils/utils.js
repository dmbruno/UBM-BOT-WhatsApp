const db = require('../database');

// Obtener un usuario por teléfono
const getUserByPhone = async (telefono) => {
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
const saveUser = async ({ nombre, telefono, correo }) => {
    console.log("Datos recibidos en saveUser:", { nombre, telefono, correo }); // Agrega este log
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

module.exports = {
    getUserByPhone,
    saveUser,
};