const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database'); // Ajusta la ruta al archivo de la base de datos
const { getUserByPhone } = require('../../utils/utils'); // Ajusta la ruta a la función de utilidades



const flowTesoros = addKeyword(EVENTS.ACTION) // Palabras clave para activar el flujo
    .addAnswer("🇮🇹🇭🇷 *Tesoros del Adriático: Italia y Croacia* 🇮🇹🇭🇷", {
        media: "https://drive.google.com/uc?export=view&id=1FvnJHRRdgB_ZfUvNkA7ORQlGvzG997WG", // Enlace directo a la imagen
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
        "🤔 ¿Te gustaría recibir más información sobre *Tesoros del Adriático: Italia y Croacia*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("🔍 [flowTesoros] Flujo iniciado.");

            const userId = ctx.from;
            console.log("🔍 [flowTesoros] userId capturado:", userId);

            if (!userId) {
                console.error("❌ [flowTesoros] Error: No se pudo obtener el ID del usuario.");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowTesoros] Usuario ingresó:", input);

            if (!input) {
                console.error("❌ [flowTesoros] Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                console.log("🔍 [flowTesoros] Buscando usuario en la base de datos...");
                const user = await getUserByPhone(userId);
                console.log("✅ [flowTesoros] Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.error("❌ [flowTesoros] Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                if (input === "sí" || input === "si") {
                    console.log("✅ [flowTesoros] Usuario interesado en el paquete.");

                    const dataToInsert = {
                        usuario_id: user.id,
                        flujo: 'Tesoros-Adriatico',
                        respuesta: 'Interesado',
                        fecha: new Date().toISOString()
                    };
                    console.log("📝 [flowTesoros] Datos para insertar:", dataToInsert);

                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [dataToInsert.usuario_id, dataToInsert.flujo, dataToInsert.respuesta, dataToInsert.fecha],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowTesoros] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowTesoros] Interacción registrada correctamente.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado";
                    console.log("📬 [flowTesoros] Correo del usuario:", correo);

                    return await flowDynamic(
                        `✅ ¡Genial! Hemos registrado tu interés en 🇮🇹🇭🇷 *Tesoros del Adriático: Italia y Croacia* 🇮🇹🇭🇷.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowTesoros] Usuario no está interesado en el paquete.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowTesoros] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowTesoros] Error procesando la solicitud:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    );

module.exports = flowTesoros;