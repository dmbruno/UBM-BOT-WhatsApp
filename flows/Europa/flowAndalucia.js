const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database'); // Ajusta la ruta al archivo de la base de datos
const { getUserByPhone } = require('../../utils/utils'); // Ajusta la ruta a la función de utilidades

const flowAndalucia = addKeyword(EVENTS.ACTION) // Palabras clave para activar el flujo
    .addAnswer("🌍 *Andalucía, Madrid y Portugal* 🇪🇸🇵🇹", {
        media: "https://drive.google.com/uc?export=view&id=1EPkwahaBblZxvmEpFX1Msdwxp15qrT27", // Reemplaza con el enlace de la imagen
    })
    .addAnswer(
        "📝 *¿Qué incluye este paquete?*\n\n" +
        "✈️ Aéreo + Traslados + Alojamiento con desayuno. 🛏️\n" +
        "🍷 Cata de vinos y crucero en Oporto. 🚢\n" +
        "🏙️ Visitas panorámicas en 7 ciudades. 🏰\n" +
        "🩺 Asistencia al viajero Infinit. 🚌👨‍✈️\n" +
        "✨ Y mucho más... 🌍\n\n" +
        "🎁 *¡Un viaje cultural e histórico que recordarás para siempre!* ✨",
        { delay: 1000 } // Pequeño retraso para mejor experiencia del usuario
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más información sobre *Andalucía, Madrid y Portugal*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("🔍 [flowAndalucia] Flujo iniciado.");

            const userId = ctx.from;
            console.log("🔍 [flowAndalucia] userId capturado:", userId);

            if (!userId) {
                console.error("❌ [flowAndalucia] Error: No se pudo obtener el ID del usuario.");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            // Capturar la respuesta del usuario
            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowAndalucia] Usuario ingresó:", input);

            if (!input) {
                console.error("❌ [flowAndalucia] Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                console.log("🔍 [flowAndalucia] Buscando usuario en la base de datos...");
                const user = await getUserByPhone(userId);
                console.log("✅ [flowAndalucia] Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.error("❌ [flowAndalucia] Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                if (input === "sí" || input === "si") {
                    console.log("✅ [flowAndalucia] Usuario interesado en el paquete.");

                    // Registrar solo si el usuario está interesado
                    console.log("📝 [flowAndalucia] Registrando datos del usuario en la base de datos...");
                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [user.id, 'Andalucia-Madrid-Portugal', 'Interesado', new Date().toISOString()],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowAndalucia] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowAndalucia] Interacción registrada correctamente.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado";
                    console.log("📬 [flowAndalucia] Correo del usuario:", correo);

                    return await flowDynamic(
                        `✅ ¡Genial! Hemos registrado tu interés en 🌍 *Andalucía, Madrid y Portugal* 🇪🇸🇵🇹.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowAndalucia] Usuario no está interesado en el paquete.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowAndalucia] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowAndalucia] Error procesando la solicitud:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    );

module.exports = flowAndalucia;