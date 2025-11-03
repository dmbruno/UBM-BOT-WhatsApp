const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const db = require('../../database'); // Ajusta la ruta al archivo de la base de datos
const { getUserByPhone } = require('../../utils/utils'); // Ajusta la ruta a la función de utilidades

const flowAventuraIberica = addKeyword(EVENTS.ACTION)
    .addAnswer("🌍 *Aventura Ibérica: Madrid, Andalucía, Portugal y Barcelona* 🇪🇸🇵🇹", {
        media: "https://drive.google.com/uc?export=view&id=1fc9gLVtZpKIaUgzZIhhntPEz-cN70zy_",
    })
    .addAnswer(
        "📅 *Salida:* 07 de marzo - 14 noches\n" +
        "✈️ *Desde:* Buenos Aires\n\n" +
        "📍 *Recorrido:*\n" +
        "Madrid - Oporto - Coimbra - Fátima - Batalha - Nazaré - Alcobaça - Lisboa - Mérida - Córdoba - Sevilla - Granada - Valencia - Barcelona\n\n" +
        "✨ *Incluye:*\n" +
        "✈️ Aéreo + Traslados + Alojamiento con desayuno. 🛏️\n" +
        "🍷 Cata de vinos y crucero en Oporto. 🚢\n" +
        "🏙️ Visitas indicadas en el itinerario. 🏰\n" +
        "👨‍✈️ Guías locales de habla hispana durante todo el recorrido.\n" +
        "🎒 Kit de viaje: mochila + botella + cubrevalijas.\n" +
        "🩺 Asistencia al viajero Infinit.\n\n" +
        "💰 *Precio:*\n" +
        "Desde USD 4289 + IMP 589 por persona en base doble\n\n" +
        "📝 *La grupal saldrá acompañada desde Argentina con un mínimo de 20 pasajeros.*\n" +
        "👨‍✈️ *El acompañante es personal de Ola y con experiencia en dichos circuitos.*",
        { delay: 1000 }
    )
    .addAnswer(
        "🤔 ¿Te gustaría recibir más información sobre *Aventura Ibérica*? Escribe *sí* o *no*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log("🔍 [flowAventuraIberica] Flujo iniciado.");

            const userId = ctx.from;
            console.log("🔍 [flowAventuraIberica] userId capturado:", userId);

            if (!userId) {
                console.error("❌ [flowAventuraIberica] Error: No se pudo obtener el ID del usuario.");
                return await flowDynamic("⚠️ Hubo un problema al procesar tu solicitud. Por favor, inténtalo más tarde.");
            }

            const input = ctx.body?.trim().toLowerCase();
            console.log("🔍 [flowAventuraIberica] Usuario ingresó:", input);

            if (!input) {
                console.error("❌ [flowAventuraIberica] Entrada no válida o vacía.");
                return await flowDynamic("⚠️ No detecté tu respuesta. Por favor, escribe *sí* o *no*.");
            }

            try {
                console.log("🔍 [flowAventuraIberica] Buscando usuario en la base de datos...");
                const user = await getUserByPhone(userId);
                console.log("✅ [flowAventuraIberica] Usuario obtenido de la base de datos:", user);

                if (!user) {
                    console.error("❌ [flowAventuraIberica] Usuario no encontrado en la base de datos.");
                    return await flowDynamic("⚠️ No encontramos tu registro. Por favor, regístrate antes de continuar.");
                }

                if (input === "sí" || input === "si") {
                    console.log("✅ [flowAventuraIberica] Usuario interesado en el paquete.");

                    const dataToInsert = {
                        usuario_id: user.id,
                        flujo: 'Aventura-Iberica',
                        respuesta: 'Interesado',
                        fecha: new Date().toISOString()
                    };
                    console.log("📝 [flowAventuraIberica] Datos para insertar:", dataToInsert);

                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                            [dataToInsert.usuario_id, dataToInsert.flujo, dataToInsert.respuesta, dataToInsert.fecha],
                            (err) => {
                                if (err) {
                                    console.error("❌ [flowAventuraIberica] Error al guardar en la base de datos:", err.message);
                                    return reject(err);
                                }
                                console.log("✅ [flowAventuraIberica] Interacción registrada correctamente.");
                                resolve();
                            }
                        );
                    });

                    const correo = user.correo || "no registrado";
                    console.log("📬 [flowAventuraIberica] Correo del usuario:", correo);

                    return await flowDynamic(
                        `✅ ¡Genial! Hemos registrado tu interés en 🌍 *Aventura Ibérica* 🇪🇸🇵🇹.\n\n` +
                        `📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.\n\n` +
                        `😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`
                    );
                } else if (input === "no") {
                    console.log("✅ [flowAventuraIberica] Usuario no está interesado en el paquete.");
                    return await flowDynamic("😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.");
                } else {
                    console.error("❌ [flowAventuraIberica] Respuesta no válida:", input);
                    return await flowDynamic("⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.");
                }
            } catch (error) {
                console.error("❌ [flowAventuraIberica] Error procesando la solicitud:", error.message);
                return await flowDynamic("⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.");
            }
        }
    );

module.exports = flowAventuraIberica;
