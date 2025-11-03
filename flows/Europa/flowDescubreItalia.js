const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database');
const { getUserByPhone } = require('../../utils/utils');

const flowDescubreItalia = addKeyword(EVENTS.ACTION)
    .addAnswer("🌍 *Descubre Italia* 🇮🇹", {
        media: "https://drive.google.com/uc?export=view&id=1iuGavfptvEEivL9MMNOO3_3Rg62FO35L",
    })
    .addAnswer(
        "📅 *Salida:* 22 de mayo - 14 noches\n" +
        "✈️ *Desde:* Buenos Aires\n\n" +
        "📍 *Recorrido:*\n" +
        "Milán - Sirmione - Verona - Venecia - Murano - Burano - Florencia - Cinque Terre - Pisa - Siena - San Gimignano - Chianti - Asís - Roma - Pompeya - Sorrento - Capri - Salerno - Costa Amalfitana - Pertosa Grutas - Paestum - Nápoles\n\n" +
        "✨ *Incluye:*\n" +
        "✈️ Aéreo Buenos Aires / Milán // Nápoles / Buenos Aires. 🛏️\n" +
        "🧳 1 equipaje en bodega + 1 equipaje de mano.\n" +
        "🚐 Traslados de llegada y salida del aeropuerto principal.\n" +
        "🏨 Alojamiento en hoteles céntricos con desayuno + 12 comidas\n" +
        "🎫 Excursiones y Entradas según itinerario.\n" +
        "👨‍✈️ Guía acompañante de habla hispana.\n" +
        "🎒 Kit de viaje: mochila + botella + cubrevalijas.\n" +
        "🩺 Asistencia al viajero Infinit.\n\n" +
        "💰 *Precio:*\n" +
        "Desde USD 6240 + IMP 986 por persona en base doble\n\n" +
        "📝 *La grupal saldrá acompañada desde Argentina con un mínimo de 20 pasajeros.*",
        { delay: 1000 }
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más información sobre *Descubre Italia*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("🔍 [flowDescubreItalia] Flujo iniciado.");

            const userId = ctx.from;
            console.log("🔍 [flowDescubreItalia] userId capturado:", userId);

            if (!userId) {
                console.error("❌ [flowDescubreItalia] Error: No se pudo obtener el ID del usuario.");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowDescubreItalia] Usuario ingresó:", input);

            if (!input) {
                console.error("❌ [flowDescubreItalia] Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                console.log("🔍 [flowDescubreItalia] Buscando usuario en la base de datos...");
                const user = await getUserByPhone(userId);
                console.log("✅ [flowDescubreItalia] Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.error("❌ [flowDescubreItalia] Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                if (input === "sí" || input === "si") {
                    console.log("✅ [flowDescubreItalia] Usuario interesado en el paquete.");

                    console.log("📝 [flowDescubreItalia] Registrando datos del usuario en la base de datos...");
                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [user.id, 'Descubre-Italia', 'Interesado', new Date().toISOString()],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowDescubreItalia] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowDescubreItalia] Interacción registrada correctamente.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado";
                    console.log("📬 [flowDescubreItalia] Correo del usuario:", correo);

                    return await flowDynamic(
                        `✅ ¡Genial! Hemos registrado tu interés en 🇮🇹 *Descubre Italia*.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowDescubreItalia] Usuario no está interesado en el paquete.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowDescubreItalia] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowDescubreItalia] Error procesando la solicitud:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    );

module.exports = flowDescubreItalia;
