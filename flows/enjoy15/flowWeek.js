const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database'); // Ajusta la ruta al archivo de la base de datos
const { getUserByPhone } = require('../../utils/utils'); // Ajusta la ruta a la función de utilidades

const flowWeek = addKeyword(EVENTS.ACTION) // Palabras clave para activar el flujo
    .addAnswer("🎉 *Paquete Week* 🌟", {
        media: "https://drive.google.com/uc?export=view&id=1AHFTvgu7mf2ZDNHnl_dTtswFYlxdUhHf", // Imagen del paquete Week
    })
    .addAnswer(
        "📝 *¿Qué incluye el paquete WEEK?*\n\n" +
        "✅ Vuelos y traslados ✈️🚌\n" +
        "✅ Alojamiento dentro de Disney 🏰\n" +
        "✅ La mejor asistencia médica 🩺\n" +
        "✅ Coordinación permanente 🤝\n" +
        "✅ Pensión completa con bebidas 🍔🥤\n\n" +
        "🎁 *¡Una experiencia única que no olvidarás!* 🌟",
        { delay: 1000 } // Añadimos un pequeño retraso para dar tiempo a leer el contenido
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más información sobre el *Paquete Week*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("🔍 [flowWeek] Flujo Week iniciado."); // Log para confirmar que se activa el flujo

            // Verificar si `ctx.from` (número de teléfono) es válido
            const userId = ctx.from;
            if (!userId) {
                console.error("❌ [flowWeek] Error: No se pudo obtener el ID del usuario (ctx.from es inválido).");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            console.log("✅ [flowWeek] ID del usuario:", userId); // Log del ID del usuario

            // Capturar la entrada del usuario y convertir a minúsculas
            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowWeek] Usuario ingresó:", input); // Log de la entrada del usuario

            if (!input) {
                console.error("❌ [flowWeek] Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                // Obtener usuario de la base de datos
                console.log("🔍 [flowWeek] Buscando usuario en la base de datos...");
                const user = await getUserByPhone(userId);
                console.log("✅ [flowWeek] Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.error("❌ [flowWeek] Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                // Procesar la respuesta del usuario
                if (input === "sí" || input === "si") {
                    console.log("✅ [flowWeek] Usuario interesado en el paquete Week.");

                    // Intentar guardar en la base de datos
                    console.log("📝 [flowWeek] Guardando interacción en la base de datos...");
                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [user.id, 'Paquete-Week', 'Interesado', new Date().toISOString()],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowWeek] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowWeek] Interacción registrada en la base de datos.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado"; // Manejar usuarios sin correo
                    return await flowDynamic(
                        `✅ ¡Excelente! Hemos registrado tu interés en 🎉 *Paquete Week* 🌟.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowWeek] Usuario no está interesado en el paquete Week.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowWeek] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowWeek] Error procesando el flujo Week:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    );

module.exports = flowWeek;