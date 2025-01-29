const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database'); // Ajusta la ruta al archivo de la base de datos
const { getUserByPhone } = require('../../utils/utils'); // Ajusta la ruta a la función de utilidades

const flowMexico = addKeyword(EVENTS.ACTION) // Palabras clave para activar el flujo
    .addAnswer("🇲🇽 *México: Experiencia Única en CDMX* 🇲🇽", {
        media: "https://drive.google.com/uc?export=view&id=1p0kAJ_y3rUNRGNtrg6-0y3iA66AhFetE", // Enlace directo a la imagen
    })
    .addAnswer(
        "📝 *¿Qué incluye este paquete?*\n\n" +
        "🏨 Alojamiento en CDMX y visita de la ciudad.\n" +
        "🎶 Paseo en Xochimilco con mariachis.\n" +
        "🍽️ Cena típica en Hotel Royal Reforma.\n" +
        "🌅 Visita a Taxco con almuerzo incluido.\n" +
        "⛪ Visita a la Basílica de Guadalupe y las Pirámides de Teotihuacán con almuerzo.\n\n" +
        "🎁 *¡Una experiencia cultural e histórica única en México!* ✨",
        { delay: 1000 } // Pequeño retraso para una mejor experiencia del usuario
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más información sobre *México: Experiencia Única en CDMX*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("🔍 [flowMexico] Flujo iniciado.");

            const userId = ctx.from;
            console.log("🔍 [flowMexico] userId capturado:", userId);

            if (!userId) {
                console.error("❌ [flowMexico] Error: No se pudo obtener el ID del usuario.");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowMexico] Usuario ingresó:", input);

            if (!input) {
                console.error("❌ [flowMexico] Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                console.log("🔍 [flowMexico] Buscando usuario en la base de datos...");
                const user = await getUserByPhone(userId);
                console.log("✅ [flowMexico] Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.error("❌ [flowMexico] Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                if (input === "sí" || input === "si") {
                    console.log("✅ [flowMexico] Usuario interesado en el paquete.");

                    const dataToInsert = {
                        usuario_id: user.id,
                        flujo: 'Mexico-CDMX-Experiencia',
                        respuesta: 'Interesado',
                        fecha: new Date().toISOString()
                    };
                    console.log("📝 [flowMexico] Datos para insertar:", dataToInsert);

                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [dataToInsert.usuario_id, dataToInsert.flujo, dataToInsert.respuesta, dataToInsert.fecha],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowMexico] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowMexico] Interacción registrada correctamente.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado";
                    console.log("📬 [flowMexico] Correo del usuario:", correo);

                    return await flowDynamic(
                        `✅ ¡Genial! Hemos registrado tu interés en 🇲🇽 *México: Experiencia Única en CDMX* 🇲🇽.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowMexico] Usuario no está interesado en el paquete.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowMexico] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowMexico] Error procesando la solicitud:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    );

module.exports = flowMexico;