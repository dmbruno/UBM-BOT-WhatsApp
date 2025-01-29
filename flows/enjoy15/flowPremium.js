const { addKeyword , EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database'); // Ajusta la ruta al archivo de la base de datos
const { getUserByPhone } = require('../../utils/utils'); // Ajusta la ruta a la función de utilidades


const flowPremium = addKeyword(EVENTS.ACTION) // Palabras clave para activar el flujo
    .addAnswer("🎉 *Paquete Premium* 🌟", {
        media: "https://drive.google.com/uc?export=view&id=1bwfyyxmBShBOZy09FhDewxS5PupI1tEE", // Reemplaza con el enlace directo a la imagen del paquete Premium
    })
    .addAnswer(
        "📝 *¿Qué incluye el paquete PREMIUM?*\n\n" +
        "✅ Vuelos y traslados ✈️🚌\n" +
        "✅ Alojamiento dentro de Disney 🏰\n" +
        "✅ La mejor asistencia médica 🩺\n" +
        "✅ Coordinación permanente 🤝\n" +
        "✅ Pensión completa con bebidas 🍔🥤\n\n" +
        "🎁 *¡Una experiencia única que no olvidarás!* 🌟",
        { delay: 1000 } // Añadimos un pequeño retraso para dar tiempo a leer el contenido
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más información sobre el *Paquete Premium*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("🔍 [flowPremium] Flujo Premium iniciado."); // Log para confirmar que se activa el flujo

            // Verificar si `ctx.from` (número de teléfono) es válido
            const userId = ctx.from;
            if (!userId) {
                console.error("❌ [flowPremium] Error: No se pudo obtener el ID del usuario (ctx.from es inválido).");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            console.log("✅ [flowPremium] ID del usuario:", userId); // Log del ID del usuario

            // Capturar la entrada del usuario y convertir a minúsculas
            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowPremium] Usuario ingresó:", input); // Log de la entrada del usuario

            if (!input) {
                console.error("❌ [flowPremium] Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                // Obtener usuario de la base de datos
                console.log("🔍 [flowPremium] Buscando usuario en la base de datos...");
                const user = await getUserByPhone(userId);
                console.log("✅ [flowPremium] Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.error("❌ [flowPremium] Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                // Procesar la respuesta del usuario
                if (input === "sí" || input === "si") {
                    console.log("✅ [flowPremium] Usuario interesado en el paquete Premium.");

                    // Intentar guardar en la base de datos
                    console.log("📝 [flowPremium] Guardando interacción en la base de datos...");
                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [user.id, 'Paquete-Premium', 'Interesado', new Date().toISOString()],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowPremium] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowPremium] Interacción registrada en la base de datos.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado"; // Manejar usuarios sin correo
                    return await flowDynamic(
                        `✅ ¡Excelente! Hemos registrado tu interés en 🎉 *Paquete Premium* 🌟.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowPremium] Usuario no está interesado en el paquete Premium.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowPremium] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowPremium] Error procesando el flujo Premium:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    );

module.exports = flowPremium;