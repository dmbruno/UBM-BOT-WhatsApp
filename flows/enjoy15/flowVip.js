const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database');
const { getUserByPhone } = require('../../utils/utils');

// Objeto global para almacenar datos temporales
const tempData = {};

const flowVip = addKeyword(EVENTS.ACTION) // Palabras clave para activar el flujo
    .addAnswer("🎉 *Paquete VIP* 🌟", {
        media: "https://drive.google.com/uc?export=view&id=17XwDYT5vimGSuITLA4ipnCwjTLPyeONu", // Imagen del paquete VIP
    })
    .addAnswer(
        "📝 *¿Qué incluye el paquete VIP?*\n\n" +
        "✅ Vuelos y traslados ✈️🚌\n" +
        "✅ Alojamiento dentro de Disney 🏰\n" +
        "✅ La mejor asistencia médica 🩺\n" +
        "✅ Coordinación permanente 🤝\n" +
        "✅ Pensión completa con bebidas 🍔🥤\n\n" +
        "🎁 *¡Una experiencia única que no olvidarás!* 🌟",
        { delay: 1000 } // Añadimos un pequeño retraso para dar tiempo a leer el contenido
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más información sobre el *Paquete VIP*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            const userId = ctx.from;

        
            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowVip] Usuario ingresó:", input); // Log de la entrada del usuario

            if (!input) {
                
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                // Obtener usuario de la base de datos
                
                const user = await getUserByPhone(userId);
                

                if (!user) {
                    
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                // Procesar la respuesta del usuario
                if (input === "sí" || input === "si") {
                    

                    // Intentar guardar en la base de datos
                    console.log("📝 [flowVip] Guardando interacción en la base de datos...");
                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [user.id, 'Paquete-VIP', 'Interesado', new Date().toISOString()],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowVip] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowVip] Interacción registrada en la base de datos.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado"; // Manejar usuarios sin correo
                    return await flowDynamic(
                        `✅ ¡Excelente! Hemos registrado tu interés en 🎉 *Paquete VIP* 🌟.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowVip] Usuario no está interesado en el paquete VIP.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowVip] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowVip] Error procesando el flujo VIP:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    )
    .addAnswer(
        "✨Si necesitas algo más, escribe *menu* para volver al inicio.",
        { capture: false },
        async (ctx) => {
            const userId = ctx.from;

            // Limpiar contexto al finalizar el flujo
            delete tempData[userId];
            console.log(`🧹 [flowVip] Contexto limpiado para el usuario: ${userId}`);
        }
    );

module.exports = flowVip;