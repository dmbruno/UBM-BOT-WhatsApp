const { addKeyword } = require('@bot-whatsapp/bot');
const { getUserByPhone } = require('../utils/utils'); // Función para obtener usuario por teléfono
const db = require('../database');

// Objeto global para almacenar datos temporales
const tempData = {};

const flowConsultas = addKeyword(['consultas'])
    .addAction(async (ctx, { flowDynamic }) => {
        const userId = ctx.from;

        // Inicializar tempData para el usuario si no existe
        tempData[userId] = tempData[userId] || { resumen: '' };

        // Obtener usuario de la base de datos
        const user = await getUserByPhone(userId);

        if (!user) {
            await flowDynamic("⚠️ No encontramos tu registro. Por favor, escribe 'menu' para volver al menú principal.");
            return;
        }

        // Guardamos el usuario en tempData
        tempData[userId].usuario_id = user.id;
        tempData[userId].nombre = user.nombre;
        tempData[userId].correo = user.correo;

        console.log(`✅ Usuario encontrado: ${user.nombre} (${userId})`);
    })
    .addAnswer(
        "👥 ¿Cuántos pasajeros son?\nPor favor, indica el número de adultos y si hay menores con edades (0 a 11 años).",
        { capture: true },
        async (ctx) => {
            const userId = ctx.from;
            const input = ctx.body.trim();

            tempData[userId].pasajeros = input;
            tempData[userId].resumen += `👥 *Pasajeros:* ${input}\n`;

            console.log(`✅ Pasajeros capturados: ${input}`);
        }
    )
    .addAnswer(
        "📅 Perfecto, ¿en qué mes o meses estarías disponible para viajar? (Ejemplo: Enero, Febrero, etc.)",
        { capture: true },
        async (ctx) => {
            const userId = ctx.from;
            const input = ctx.body.trim();

            tempData[userId].meses_disponibles = input;
            tempData[userId].resumen += `📅 *Meses disponibles:* ${input}\n`;

            console.log(`✅ Meses disponibles capturados: ${input}`);
        }
    )
    .addAnswer(
        "⏳ ¿Cuántos días te gustaría viajar aproximadamente?",
        { capture: true },
        async (ctx) => {
            const userId = ctx.from;
            const input = ctx.body.trim();

            tempData[userId].duracion = input;
            tempData[userId].resumen += `⏳ *Duración:* ${input} días\n`;

            console.log(`✅ Duración capturada: ${input}`);
        }
    )
    .addAnswer(
        "🌍 ¿Cuál es tu destino preferido? ¿Tienes una segunda opción?",
        { capture: true },
        async (ctx) => {
            const userId = ctx.from;
            const input = ctx.body.trim();

            tempData[userId].destino = input;
            tempData[userId].resumen += `🌍 *Destino preferido:* ${input}\n`;

            console.log(`✅ Destino capturado: ${input}`);
        }
    )
    .addAnswer(
        "📄 Aquí tienes un resumen de tu *consulta*:",
        { capture: false },
        async (ctx, { flowDynamic }) => {
            const userId = ctx.from;

            const resumenCompleto = `📄 Gracias por toda la información, *${tempData[userId].nombre}*.\n\n` +
                `📝 Resumen de tu consulta:\n${tempData[userId].resumen}\n\n` +
                `✨ Nuestros agentes se comunicarán contigo pronto a tu correo: *${tempData[userId].correo}*. ¡Gracias por elegirnos!`;

            await flowDynamic(resumenCompleto);

            try {
                // Guardar en la base de datos
                const { usuario_id, pasajeros, meses_disponibles, duracion, destino } = tempData[userId];
                await new Promise((resolve, reject) => {
                    db.run(
                        `INSERT INTO consultas (usuario_id, pasajeros, meses_disponibles, duracion, destino) VALUES (?, ?, ?, ?, ?)`,
                        [usuario_id, pasajeros, meses_disponibles, duracion, destino],
                        (err) => {
                            if (err) {
                                console.error("Error guardando consulta:", err.message);
                                return reject(err);
                            }
                            console.log("✅ Consulta guardada correctamente.");
                            resolve();
                        }
                    );
                });

                // Limpiar tempData después de guardar
                delete tempData[userId];
                console.log(`🧹 Datos temporales limpiados para el usuario: ${userId}`);
            } catch (error) {
                console.error("❌ Error guardando la consulta:", error.message);
                await flowDynamic("⚠️ Ocurrió un problema guardando tu consulta. Por favor, inténtalo más tarde.");
            }
        }
    )
    .addAnswer(
        "✨ Si necesitas algo más, escribe *menu* para volver al inicio.",
        { capture: false }
    );

module.exports = flowConsultas;