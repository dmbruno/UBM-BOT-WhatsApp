const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database'); // Ajusta la ruta al archivo de la base de datos
const { getUserByPhone } = require('../../utils/utils'); // Ajusta la ruta a la función de utilidades

const flowUSA = addKeyword(EVENTS.ACTION) // Palabras clave para activar el flujo
    .addAnswer("🇺🇸 *Estados Unidos: Grandes Ciudades y Paisajes Naturales* 🌎", {
        media: "https://drive.google.com/uc?export=view&id=161j1Kftc7-SZOjtzap7lmK2iyT6i0AKp", // Reemplaza con el enlace directo transformado
    })
    .addAnswer(
        "📝 *¿Qué incluye este paquete?*\n\n" +
        "🏨 15 noches con desayuno. 🍳\n" +
        "✈️ Desde Buenos Aires con aéreo. 🛫\n" +
        "🚐 Traslados in-out. 🚍\n" +
        "🗺️ Excursiones según itinerario. 📍\n" +
        "🎒 Kit de viaje. 🎁\n\n" +
        "🎁 *¡Un viaje inolvidable por las grandes ciudades y paisajes naturales de Estados Unidos!* 🇺🇸",
        { delay: 1000 } // Pequeño retraso para una mejor experiencia del usuario
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más información sobre *Estados Unidos: Grandes Ciudades y Paisajes Naturales*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("🔍 [flowUSA] Flujo iniciado.");

            const userId = ctx.from;
            console.log("🔍 [flowUSA] userId capturado:", userId);

            if (!userId) {
                console.error("❌ [flowUSA] Error: No se pudo obtener el ID del usuario.");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowUSA] Usuario ingresó:", input);

            if (!input) {
                console.error("❌ [flowUSA] Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                console.log("🔍 [flowUSA] Buscando usuario en la base de datos...");
                const user = await getUserByPhone(userId);
                console.log("✅ [flowUSA] Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.error("❌ [flowUSA] Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                if (input === "sí" || input === "si") {
                    console.log("✅ [flowUSA] Usuario interesado en el paquete.");

                    const dataToInsert = {
                        usuario_id: user.id,
                        flujo: 'USA-Ciudades-Paisajes',
                        respuesta: 'Interesado',
                        fecha: new Date().toISOString()
                    };
                    console.log("📝 [flowUSA] Datos para insertar:", dataToInsert);

                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [dataToInsert.usuario_id, dataToInsert.flujo, dataToInsert.respuesta, dataToInsert.fecha],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowUSA] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowUSA] Interacción registrada correctamente.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado";
                    console.log("📬 [flowUSA] Correo del usuario:", correo);

                    return await flowDynamic(
                        `✅ ¡Genial! Hemos registrado tu interés en 🇺🇸 *Estados Unidos: Grandes Ciudades y Paisajes Naturales* 🌎.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowUSA] Usuario no está interesado en el paquete.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowUSA] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowUSA] Error procesando la solicitud:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    );

module.exports = flowUSA;