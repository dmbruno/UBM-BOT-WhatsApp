const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database'); // Ajusta la ruta al archivo de la base de datos
const { getUserByPhone } = require('../../utils/utils'); // Ajusta la ruta a la función de utilidades

const flowClassic = addKeyword(EVENTS.ACTION) // Palabras clave para activar el flujo
    .addAnswer("🎉 *Paquete Classic* 🌟", {
        media: "https://drive.google.com/uc?export=view&id=1xJtlGdHTL6QRuxcbFYa0RDfhzSV1Rkd2", // Imagen del paquete Classic
    })
    .addAnswer(
        "📝 *¿Qué incluye el paquete CLASSIC?*\n\n" +
        "✅ Vuelos y traslados ✈️🚌\n" +
        "✅ Alojamiento dentro de Disney 🏰\n" +
        "✅ La mejor asistencia médica 🩺\n" +
        "✅ Coordinación permanente 🤝\n" +
        "✅ Pensión completa con bebidas 🍔🥤\n\n" +
        "🎁 *¡Una experiencia única que no olvidarás!* 🌟",
        { delay: 1000 } // Añadimos un pequeño retraso para dar tiempo a leer el contenido
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más información sobre el *Paquete Classic*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("🔍 [flowClassic] Flujo Classic iniciado."); // Log para confirmar que se activa el flujo

            // Verificar si `ctx.from` (número de teléfono) es válido
            const userId = ctx.from;
            if (!userId) {
                console.error("❌ [flowClassic] Error: No se pudo obtener el ID del usuario (ctx.from es inválido).");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            console.log("✅ [flowClassic] ID del usuario:", userId); // Log del ID del usuario

            // Capturar la entrada del usuario y convertir a minúsculas
            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowClassic] Usuario ingresó:", input); // Log de la entrada del usuario

            if (!input) {
                console.error("❌ [flowClassic] Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                // Obtener usuario de la base de datos
                console.log("🔍 [flowClassic] Buscando usuario en la base de datos...");
                const user = await getUserByPhone(userId);
                console.log("✅ [flowClassic] Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.error("❌ [flowClassic] Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                // Procesar la respuesta del usuario
                if (input === "sí" || input === "si") {
                    console.log("✅ [flowClassic] Usuario interesado en el paquete Classic.");

                    // Intentar guardar en la base de datos
                    console.log("📝 [flowClassic] Guardando interacción en la base de datos...");
                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [user.id, 'Paquete-Classic', 'Interesado', new Date().toISOString()],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowClassic] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowClassic] Interacción registrada en la base de datos.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado"; // Manejar usuarios sin correo
                    return await flowDynamic(
                        `✅ ¡Excelente! Hemos registrado tu interés en 🎉 *Paquete Classic* 🌟.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowClassic] Usuario no está interesado en el paquete Classic.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowClassic] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowClassic] Error procesando el flujo Classic:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    );

module.exports = flowClassic;