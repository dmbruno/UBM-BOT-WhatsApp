const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database');
const { getUserByPhone } = require('../../utils/utils');

const flowCoreaJapon = addKeyword(EVENTS.ACTION)
    .addAnswer("🌏 *Corea y Japón* 🇰🇷🇯🇵", {
        media: "https://drive.google.com/uc?export=view&id=16Iw5Yh3ZUKfhd-HbblMseS_wEqzsXc2C",
    })
    .addAnswer(
        "📅 *Salida:* 27 de febrero - 13 noches\n" +
        "✈️ *Desde:* Buenos Aires\n\n" +
        "📍 *Recorrido:*\n" +
        "Seúl - Jeonju - Busan - Shimonoseki - Hiroshima - Matsuyama - Kobe - Osaka - Monte Koya - Kioto - Tokio\n\n" +
        "✨ *Incluye:*\n" +
        "✈️ Aéreo + Traslados + Alojamiento con desayuno. 🛏️\n" +
        "🏙️ Visitas según itinerario. 🏯\n" +
        "🧳 1 equipaje en bodega de 23 kg + 1 equipaje de mano de 10kg.\n" +
        "👨‍✈️ Guías locales de habla hispana durante todo el recorrido.\n" +
        "🎒 Kit de viaje: mochila + botella + cubrevalijas.\n" +
        "🩺 Asistencia al viajero Infinit.\n\n" +
        "💰 *Precio:*\n" +
        "Desde USD 6576 + IMP 1150 por persona en base doble\n\n" +
        "📝 *La grupal saldrá acompañada desde Argentina con un mínimo de 20 pasajeros.*",
        { delay: 1000 }
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más información sobre *Corea y Japón*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("🔍 [flowCoreaJapon] Flujo iniciado.");

            const userId = ctx.from;
            console.log("🔍 [flowCoreaJapon] userId capturado:", userId);

            if (!userId) {
                console.error("❌ [flowCoreaJapon] Error: No se pudo obtener el ID del usuario.");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowCoreaJapon] Usuario ingresó:", input);

            if (!input) {
                console.error("❌ [flowCoreaJapon] Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                console.log("🔍 [flowCoreaJapon] Buscando usuario en la base de datos...");
                const user = await getUserByPhone(userId);
                console.log("✅ [flowCoreaJapon] Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.error("❌ [flowCoreaJapon] Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                if (input === "sí" || input === "si") {
                    console.log("✅ [flowCoreaJapon] Usuario interesado en el paquete.");

                    console.log("📝 [flowCoreaJapon] Registrando datos del usuario en la base de datos...");
                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [user.id, 'Corea-Japon', 'Interesado', new Date().toISOString()],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowCoreaJapon] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowCoreaJapon] Interacción registrada correctamente.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado";
                    console.log("📬 [flowCoreaJapon] Correo del usuario:", correo);

                    return await flowDynamic(
                        `✅ ¡Genial! Hemos registrado tu interés en 🌏 *Corea y Japón* 🇰🇷🇯🇵.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowCoreaJapon] Usuario no está interesado en el paquete.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowCoreaJapon] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowCoreaJapon] Error procesando la solicitud:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    );

module.exports = flowCoreaJapon;
