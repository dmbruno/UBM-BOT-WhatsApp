const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database'); // Ajusta la ruta a tu archivo de base de datos
const { getUserByPhone } = require('../../utils/utils'); // Ajusta la ruta a tu archivo de utilidades

const flowEspanaPortugalMarruecos = addKeyword(EVENTS.ACTION) // Palabras clave para activar el flujo
    .addAnswer("🌍 *España, Portugal y Marruecos* 🇪🇸🇵🇹🇲🇦", {
        media: "https://drive.google.com/uc?export=view&id=1M6LXcq7EKYzbafJRuyHRvbsr8PCckivg", // Enlace directo de la imagen
    })
    .addAnswer(
        "📝 *¿Qué incluye este paquete?*\n\n" +
        "🌙 22 noches con 4 comidas incluidas. 🥘\n" +
        "✈️ Desde COR con Air Europa. 🛫\n" +
        "🚐 Traslados in-out. 🚌\n" +
        "🏰 Visitas según itinerario. 🗺️\n" +
        "🎒 Kit de viaje. 🎁\n\n" +
        "🎁 *¡Un viaje lleno de cultura, historia y belleza por tres países increíbles!* ✨",
        { delay: 1000 } // Pequeño retraso para una mejor experiencia del usuario
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más información sobre *España, Portugal y Marruecos*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("🔍 [flowEspanaPortugalMarruecos] Flujo iniciado.");

            const userId = ctx.from;
            console.log("🔍 [flowEspanaPortugalMarruecos] userId capturado:", userId);

            if (!userId) {
                console.error("❌ [flowEspanaPortugalMarruecos] Error: No se pudo obtener el ID del usuario.");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowEspanaPortugalMarruecos] Usuario ingresó:", input);

            if (!input) {
                console.error("❌ [flowEspanaPortugalMarruecos] Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                console.log("🔍 [flowEspanaPortugalMarruecos] Buscando usuario en la base de datos...");
                const user = await getUserByPhone(userId);
                console.log("✅ [flowEspanaPortugalMarruecos] Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.error("❌ [flowEspanaPortugalMarruecos] Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                if (input === "sí" || input === "si") {
                    console.log("✅ [flowEspanaPortugalMarruecos] Usuario interesado en el paquete.");

                    const dataToInsert = {
                        usuario_id: user.id,
                        flujo: 'Espana-Portugal-Marruecos',
                        respuesta: 'Interesado',
                        fecha: new Date().toISOString()
                    };
                    console.log("📝 [flowEspanaPortugalMarruecos] Datos para insertar:", dataToInsert);

                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [dataToInsert.usuario_id, dataToInsert.flujo, dataToInsert.respuesta, dataToInsert.fecha],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowEspanaPortugalMarruecos] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowEspanaPortugalMarruecos] Interacción registrada correctamente.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado";
                    console.log("📬 [flowEspanaPortugalMarruecos] Correo del usuario:", correo);

                    return await flowDynamic(
                        `✅ ¡Genial! Hemos registrado tu interés en 🌍 *España, Portugal y Marruecos* 🇪🇸🇵🇹🇲🇦.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowEspanaPortugalMarruecos] Usuario no está interesado en el paquete.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowEspanaPortugalMarruecos] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowEspanaPortugalMarruecos] Error procesando la solicitud:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    );

module.exports = flowEspanaPortugalMarruecos;