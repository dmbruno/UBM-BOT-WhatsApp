const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../database');
const { getUserByPhone } = require('../utils/utils');

const flowFormula1 = addKeyword(EVENTS.ACTION)
    .addAnswer("🏎️ *Fórmula 1* 🌟", {
        media: "https://drive.google.com/uc?export=view&id=1RguBIMnae7cs6EU6d_h1sDZIRH3KJGcg",
    })
    .addAnswer(
        "📝 *¿Qué incluye este paquete?*\n\n" +
        "🏨 *3 noches en hotel 3* con desayuno.*\n" +
        "🚐 *Traslados al hotel y circuito por 3 días.*\n" +
        "🎫 *Tickets Sector G + Kit F1.*\n" +
        "🩺 *Asistencia médica Intermac.*\n\n" +
        "✨ *¡Disfruta de una experiencia única en el Circuito Interlagos de São Paulo!* 🏎️",
        { delay: 1000 } // Pequeño retraso para mejorar la experiencia del usuario
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más info? *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("Iniciando flujo Fórmula 1...");
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
                    console.log("El usuario está interesado en Fórmula 1.");

                    // Guardar interacción en la base de datos
                    await new Promise((resolve, reject) => {
                        console.log("Insertando interacción en la base de datos...");
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [user.id, 'Fórmula 1', 'Interesado', new Date().toISOString()],
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
                        `✅ ¡Excelente! Hemos registrado tu interés en *Fórmula 1*! 🏎️\n\n` +
                        `📫 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("El usuario no está interesado en Fórmula 1.");
                    await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.log("Respuesta del usuario no válida.");
                    await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("Error en el flujo de Fórmula 1:", error.message);
                await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, intenta nuevamente.");
            }

            console.log("Finalizando flujo Fórmula 1...");
        }
    );

module.exports = flowFormula1;