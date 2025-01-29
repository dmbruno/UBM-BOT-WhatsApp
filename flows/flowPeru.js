const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../database');
const { getUserByPhone } = require('../utils/utils');

const flowPeru = addKeyword(EVENTS.ACTION)
    .addAnswer("✈️ *Salida Grupal a Perú* 🇵🇪", {
        media: "https://drive.google.com/uc?export=view&id=1htnAaC18otsqAID56nSCSFxSOiCREUwp",
    })
    .addAnswer("✈️ *Salida Grupal a Perú* 🇵🇪", {
        media: "https://drive.google.com/uc?export=view&id=1VTqWTBaSFgAsyROOwspPvQa_xTpbKq-j",
    })
    .addAnswer(
        "🤔 ¿Te gustaría recibir más info.? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("Inicio del flujo ✈️ *Salida Grupal a Perú* 🇵🇪");

            // Verificar si `ctx.from` es válido
            const userId = ctx.from;
            if (!userId) {
                console.error("Error: No se pudo obtener el ID del usuario.");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            // Capturar la entrada del usuario
            const input = ctx.body?.trim().toLowerCase();
            if (!input) {
                console.log("Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                // Obtener usuario de la base de datos
                const user = await getUserByPhone(userId);
                console.log("Usuario obtenido:", user);

                if (!user) {
                    console.log("Usuario no encontrado.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                // Procesar la respuesta del usuario
                if (input === "sí" || input === "si") {
                    console.log("El usuario está interesado en ✈️ *Salida Grupal a Perú* 🇵🇪.");

                    // Insertar la interacción en la base de datos
                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [user.id, 'Grupal-Peru', 'Interesado', new Date().toISOString()],
                            (err) => {
                                if (err) {
                                    console.error("Error al registrar interacción:", err.message);
                                    return reject(err);
                                }
                                console.log("Interacción registrada exitosamente.");
                                resolve();
                            }
                        );
                    });

                    // Construir mensaje personalizado
                    const correo = user.correo || "no registrado"; // Si no hay correo, usar "no registrado"
                    await flowDynamic(
                        `✅ ¡Excelente! Hemos registrado tu interés en ✈️ *Salida Grupal a Perú* 🇵🇪!\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("El usuario no está interesado en ✈️ *Salida Grupal a Perú* 🇵🇪.");
                    await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.log("Respuesta no válida por parte del usuario.");
                    await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("Error procesando el flujo ✈️ *Salida Grupal a Perú* 🇵🇪:", error.message);
                await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }

            console.log("Finalizando flujo ✈️ *Salida Grupal a Perú* 🇵🇪.");
        }
    );

module.exports = flowPeru;