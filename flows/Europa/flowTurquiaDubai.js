const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database');
const { getUserByPhone } = require('../../utils/utils');

const flowTurquiaDubai = addKeyword(EVENTS.ACTION)
    .addAnswer("🌍 *Turquía de Ensueño y Dubái de Lujo* 🇹🇷🇦🇪", {
        media: "https://drive.google.com/uc?export=view&id=1SJlIY6V0RYj7DGbzAQ1cWCedQk4EEDt3",
    })
    .addAnswer(
        "📅 *Salida:* 01 de febrero - 14 noches\n" +
        "✈️ *Desde:* Buenos Aires\n\n" +
        "📍 *Recorrido:*\n" +
        "Estambul - Ankara - Capadocia - Pamukkale - Éfeso - Ízmir/Kusadasi - Pérgamo - Troya - Canakkale - Bursa - Estambul - Dubái\n\n" +
        "✨ *Incluye:*\n" +
        "✈️ Aéreos + alojamiento con desayuno + traslados\n" +
        "🏙️ Visitas según itinerario con guía de habla hispana\n" +
        "🧳 Incluye equipaje 23kg\n" +
        "🩺 Asistencia al viajero infinit\n" +
        "🎒 Kit de viaje: mochila + botella + cubrevalijas.\n\n" +
        "💰 *Precio:*\n" +
        "Desde USD 3573 + IMP 900 por persona en base doble\n\n" +
        "📝 *La grupal saldrá acompañada desde Argentina con un mínimo de 20 pasajeros.*",
        { delay: 1000 }
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más información sobre *Turquía y Dubái*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("🔍 [flowTurquiaDubai] Flujo iniciado.");

            const userId = ctx.from;
            console.log("🔍 [flowTurquiaDubai] userId capturado:", userId);

            if (!userId) {
                console.error("❌ [flowTurquiaDubai] Error: No se pudo obtener el ID del usuario.");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowTurquiaDubai] Usuario ingresó:", input);

            if (!input) {
                console.error("❌ [flowTurquiaDubai] Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                console.log("🔍 [flowTurquiaDubai] Buscando usuario en la base de datos...");
                const user = await getUserByPhone(userId);
                console.log("✅ [flowTurquiaDubai] Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.error("❌ [flowTurquiaDubai] Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                if (input === "sí" || input === "si") {
                    console.log("✅ [flowTurquiaDubai] Usuario interesado en el paquete.");

                    console.log("📝 [flowTurquiaDubai] Registrando datos del usuario en la base de datos...");
                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [user.id, 'Turquia-Dubai', 'Interesado', new Date().toISOString()],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowTurquiaDubai] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowTurquiaDubai] Interacción registrada correctamente.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado";
                    console.log("📬 [flowTurquiaDubai] Correo del usuario:", correo);

                    return await flowDynamic(
                        `✅ ¡Genial! Hemos registrado tu interés en 🌍 *Turquía y Dubái* 🇹🇷🇦🇪.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowTurquiaDubai] Usuario no está interesado en el paquete.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowTurquiaDubai] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowTurquiaDubai] Error procesando la solicitud:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    );

module.exports = flowTurquiaDubai;
