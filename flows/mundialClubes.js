const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../database');
const { getUserByPhone } = require('../utils/utils');

const flowMundialClubes = addKeyword(EVENTS.ACTION)
    .addAnswer("⚽ *Mundial de Clubes* 🌍", {
        media: "https://drive.google.com/uc?export=view&id=1LIt0yK4mgX4WJLhNY0vz4JdN7-bYax-F",
    })
    .addAnswer(
        "📝 *¿Qué incluye este paquete?*\n\n" +
        "🌙 *9 o 12 noches en Estados Unidos en hotel 3 estrellas.*\n" +
        "🎫 *Tickets Categoría 3 para 3 partidos de Fase de Grupos siguiendo a Boca o River.*\n" +
        "📞 *Asistencia al viajero.*\n" +
        "✨ *Y mucho más...*\n\n" +
        "💰 *Paquetes desde USD 2.999.*\n" +
        "⚽ *¡No te pierdas esta oportunidad única para vivir el fútbol internacional!*",
        { delay: 1000 } // Pequeño retraso para mejorar la experiencia del usuario
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir mas info.? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("Iniciando flujo Mundial de Clubes...");
            console.log("Contexto (ctx):", ctx);

            const userId = ctx.from; // Identificador del usuario
            const input = ctx.body.trim().toLowerCase(); // Entrada del usuario

            try {
                // Obtener usuario desde la base de datos
                const user = await getUserByPhone(userId);
                console.log("Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.log("Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                if (input === "sí" || input === "si") {
                    console.log("El usuario está interesado en Mundial de Clubes.");

                    // Guardar interacción en la base de datos
                    await new Promise((resolve, reject) => {
                        console.log("Insertando interacción en la base de datos...");
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [user.id, 'Mundial de Clubes', 'Interesado', new Date().toISOString()],
                            (err) => {
                                if (err) {
                                    console.error("Error al guardar interacción en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("Interacción guardada exitosamente en la base de datos.");
                                resolve();
                            }
                        );
                    });

                    // Construir mensaje personalizado
                    const correo = user.correo || "no registrado"; // Si no hay correo, usar "no registrado"
                    await flowDynamic(
                        `✅ ¡Excelente! Hemos registrado tu interés en *Mundial de Clubes*! ⚽🌍\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("El usuario no está interesado en Mundial de Clubes.");
                    await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.log("Respuesta del usuario no válida.");
                    await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("Error en el flujo de Mundial de Clubes:", error.message);
                await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, intenta nuevamente.");
            }

            console.log("Finalizando flujo Mundial de Clubes...");
        }
    );

module.exports = flowMundialClubes;