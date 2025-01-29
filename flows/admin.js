const { addKeyword } = require('@bot-whatsapp/bot');
const db = require('../database');
 // Ajusta la ruta si está en una carpeta diferente


// Lista de números de administradores
const adminNumbers = ['5493875051112','5493875396909']; // Reemplaza con tu número

const flowAdmin = addKeyword(['admin'])
    .addAnswer(
        "🔑 *Modo Administrador Activado*. Escribe el tipo de información que deseas consultar:\n\n" +
        "1️⃣ *Usuarios*\n" +
        "2️⃣ *Consultas*\n" +
        "3️⃣ *Interacciones*\n\n" +
        "Escribe el número correspondiente. Y si deseas volver solo escribe *Menu*.",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            const userId = ctx.from;

            // Verifica si el usuario es un administrador
            if (!adminNumbers.includes(userId)) {
                return await flowDynamic("❌ No tienes permisos para acceder a esta función.");
            }

            const input = ctx.body.trim();
            let result;

        
            
            try {
                const dbQuery = async (query) => {
                    return new Promise((resolve, reject) => {
                        db.all(query, [], (err, rows) => {
                            if (err) reject(err);
                            resolve(rows);
                        });
                    });
                };

                if (input === '1') {
                    result = await dbQuery(`SELECT * FROM usuarios;`);
                } else if (input === '2') {
                    result = await dbQuery(`
                        SELECT 
                            usuarios.nombre AS usuario_nombre,
                            usuarios.telefono AS usuario_telefono,
                            usuarios.correo AS usuario_correo,
                            consultas.pasajeros AS consulta_pasajeros,
                            consultas.meses_disponibles AS consulta_meses_disponibles,
                            consultas.duracion AS consulta_duracion,
                            consultas.destino AS consulta_destino,
                            consultas.fecha AS consulta_fecha
                        FROM 
                            consultas
                        LEFT JOIN 
                            usuarios
                        ON 
                            consultas.usuario_id = usuarios.id;
                    `);
                } else if (input === '3') {
                    result = await dbQuery(`
                        SELECT 
                            usuarios.nombre AS usuario_nombre,
                            interacciones.flujo AS flujo_interaccion,
                            interacciones.respuesta AS respuesta_interaccion,
                            interacciones.fecha AS fecha_interaccion
                        FROM 
                            usuarios
                        LEFT JOIN 
                            interacciones
                        ON 
                            usuarios.id = interacciones.usuario_id;
                    `);
                } else {
                    return await flowDynamic("⚠️ Respuesta no válida. Escribe 1, 2 o 3.");
                }

                // Formatear el resultado en un mensaje
                const formattedResult = result
                    .map((row) =>
                        Object.entries(row)
                            .map(([key, value]) => `*${key}*: ${value}`)
                            .join('\n')
                    )
                    .join('\n\n');

                return await flowDynamic(
                    `✅ Aquí tienes la información solicitada:\n\n${formattedResult}`
                );
            } catch (err) {
                console.error("Error al consultar la base de datos:", err.message);
                return await flowDynamic("❌ Ocurrió un error al procesar tu solicitud.");
            }
        }
    );

module.exports = flowAdmin;