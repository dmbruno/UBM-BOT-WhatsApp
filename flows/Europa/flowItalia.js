const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database'); // Ajusta la ruta al archivo de la base de datos
const { getUserByPhone } = require('../../utils/utils'); // Ajusta la ruta a la función de utilidades




const flowItalia = addKeyword(EVENTS.ACTION) // Palabras clave para activar el flujo
    .addAnswer("🇮🇹 *Italia: Roma y Maravillas del Sur* 🇮🇹", {
        media: "https://drive.google.com/uc?export=view&id=1B0SzYacCVHU8aMojV_5skBQVgbJ8MUZC", // Reemplaza con el enlace directo de la imagen
    })
    .addAnswer(
        "📝 *¿Qué incluye este paquete?*\n\n" +
        "✈️ Aéreo + Traslados + Alojamiento con desayuno. 🛎️\n" +
        "🍽️ Once comidas extras. 🍴\n" +
        "🩺 Asistencia al viajero Infinit. 🩹🧳\n" +
        "🌆 Visitas panorámicas en 4 ciudades. 🗺️\n" +
        "✨ Y mucho más... 🌟\n\n" +
        "🎁 *¡Una experiencia italiana única para tus sentidos!* 🇮🇹",
        { delay: 1000 } // Pequeño retraso para una mejor experiencia del usuario
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más información sobre *Italia: Roma y Maravillas del Sur*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("🔍 [flowItalia] Flujo iniciado.");

            const userId = ctx.from;
            console.log("🔍 [flowItalia] userId capturado:", userId);

            if (!userId) {
                console.error("❌ [flowItalia] Error: No se pudo obtener el ID del usuario.");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowItalia] Usuario ingresó:", input);

            if (!input) {
                console.error("❌ [flowItalia] Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                console.log("🔍 [flowItalia] Buscando usuario en la base de datos...");
                const user = await getUserByPhone(userId);
                console.log("✅ [flowItalia] Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.error("❌ [flowItalia] Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                if (input === "sí" || input === "si") {
                    console.log("✅ [flowItalia] Usuario interesado en el paquete.");

                    const dataToInsert = {
                        usuario_id: user.id,
                        flujo: 'Italia-Roma-Maravillas',
                        respuesta: 'Interesado',
                        fecha: new Date().toISOString()
                    };
                    console.log("📝 [flowItalia] Datos para insertar:", dataToInsert);

                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [dataToInsert.usuario_id, dataToInsert.flujo, dataToInsert.respuesta, dataToInsert.fecha],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowItalia] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowItalia] Interacción registrada correctamente.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado";
                    console.log("📬 [flowItalia] Correo del usuario:", correo);

                    return await flowDynamic(
                        `✅ ¡Genial! Hemos registrado tu interés en 🇮🇹 *Italia: Roma y Maravillas del Sur* 🇮🇹.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowItalia] Usuario no está interesado en el paquete.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowItalia] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowItalia] Error procesando la solicitud:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    );

module.exports = flowItalia;