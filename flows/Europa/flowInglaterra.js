const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database'); // Ajusta la ruta al archivo de la base de datos
const { getUserByPhone } = require('../../utils/utils'); // Ajusta la ruta a la función de utilidades

const flowInglaterra = addKeyword(EVENTS.ACTION) // Palabras clave para activar el flujo
    .addAnswer("🇬🇧 *Inglaterra/Escocia e Irlanda* 🇬🇧🇮🇪", {
        media: "https://drive.google.com/uc?export=view&id=10KCVXzrCuf70E0xzsAgR2LFbTRO0toUR", // Enlace directo de la imagen
    })
    .addAnswer(
        "📝 *¿Qué incluye este paquete?*\n\n" +
        "✈️ Aéreo + Traslados + Alojamiento con desayuno. 🏢\n" +
        "🩺 Asistencia al viajero Infinit. 💼\n" +
        "✨ Y mucho más... 🌟\n\n" +
        "🎁 *¡Un recorrido inolvidable por las joyas del Adriático!* 🌊",
        { delay: 1000 } // Pequeño retraso para una mejor experiencia del usuario
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más información sobre *Inglaterra/Escocia e Irlanda*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("🔍 [flowInglaterra] Flujo iniciado.");

            const userId = ctx.from;
            console.log("🔍 [flowInglaterra] userId capturado:", userId);

            if (!userId) {
                console.error("❌ [flowInglaterra] Error: No se pudo obtener el ID del usuario.");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowInglaterra] Usuario ingresó:", input);

            if (!input) {
                console.error("❌ [flowInglaterra] Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                console.log("🔍 [flowInglaterra] Buscando usuario en la base de datos...");
                const user = await getUserByPhone(userId);
                console.log("✅ [flowInglaterra] Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.error("❌ [flowInglaterra] Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                if (input === "sí" || input === "si") {
                    console.log("✅ [flowInglaterra] Usuario interesado en el paquete.");

                    const dataToInsert = {
                        usuario_id: user.id,
                        flujo: 'Inglaterra-Escocia-Irlanda',
                        respuesta: 'Interesado',
                        fecha: new Date().toISOString()
                    };
                    console.log("📝 [flowInglaterra] Datos para insertar:", dataToInsert);

                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [dataToInsert.usuario_id, dataToInsert.flujo, dataToInsert.respuesta, dataToInsert.fecha],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowInglaterra] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowInglaterra] Interacción registrada correctamente.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado";
                    console.log("📬 [flowInglaterra] Correo del usuario:", correo);

                    return await flowDynamic(
                        `✅ ¡Genial! Hemos registrado tu interés en 🇬🇧 *Inglaterra/Escocia e Irlanda* 🇬🇧🇮🇪.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowInglaterra] Usuario no está interesado en el paquete.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowInglaterra] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowInglaterra] Error procesando la solicitud:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    );

module.exports = flowInglaterra;