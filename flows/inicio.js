const { addKeyword } = require('@bot-whatsapp/bot');
const { getUserByPhone, saveUser } = require('../utils/utils');
const menuFlow = require('./menu'); // Importamos el menú principal

// Variable global temporal para almacenar datos
const tempData = {};

const flowInicio = addKeyword(['hola', 'hello', 'buenas', 'menu', 'inicio'])
    .addAnswer(
        "👋 ¡Hola! Bienvenido a *UBM Viajes*",
        null,
        async (ctx, { flowDynamic, gotoFlow }) => {
            // Normalizar el userId (remover @lid, @s.whatsapp.net, etc.)
            const rawUserId = ctx.from;
            const userId = rawUserId.split('@')[0]; // Solo el número
            
            console.log('🔍 [flowInicio] ======== INICIO DEL FLUJO ========');
            console.log('🔍 [flowInicio] Raw User ID:', rawUserId);
            console.log('🔍 [flowInicio] Normalized User ID:', userId);
            console.log('🔍 [flowInicio] Mensaje recibido:', ctx.body);
            
            try {
                console.log('🔍 [flowInicio] Intentando buscar usuario en DB...');
                const user = await getUserByPhone(userId);
                console.log('🔍 [flowInicio] Resultado de búsqueda:', user);

                if (user) {
                    console.log('✅ [flowInicio] Usuario encontrado:', user.nombre);
                    await flowDynamic(`¡Hola *${user.nombre}*! 👋 ¿En qué puedo ayudarte hoy?`);
                    console.log('🔍 [flowInicio] Redirigiendo al menú...');
                    return gotoFlow(menuFlow);
                } else {
                    console.log('⚠️ [flowInicio] Usuario NO encontrado, iniciando registro...');
                    tempData[userId] = {};
                    console.log('🔍 [flowInicio] tempData inicializado para:', userId);
                    await flowDynamic("👤 Parece que eres nuevo aquí. Te voy a pedir unos datos para *registrarte*.");
                    // NO hacemos return, el flujo continúa al siguiente addAnswer
                }
            } catch (err) {
                console.error("❌ [flowInicio] ERROR CRÍTICO:", err);
                console.error("❌ [flowInicio] Error completo:", JSON.stringify(err, null, 2));
                if (err && err.stack) {
                    console.error("❌ [flowInicio] Stack trace:", err.stack);
                }
                await flowDynamic("⚠️ Hubo un problema procesando tu solicitud. Por favor, inténtalo más tarde.");
            }
        }
    )
    .addAnswer(
        "✏️ Escribe tu *nombre completo*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            try {
                const nombre = ctx.body?.trim();
                const rawUserId = ctx.from;
                const userId = rawUserId.split('@')[0]; // Normalizar

                console.log('📝 [flowInicio] Capturando nombre...');
                console.log('📝 [flowInicio] Usuario ID:', userId);
                console.log('📝 [flowInicio] Nombre recibido:', nombre);

                if (!nombre || nombre.length < 2) {
                    console.log('⚠️ [flowInicio] Nombre inválido');
                    await flowDynamic("⚠️ Por favor, ingresa un nombre válido.");
                    return;
                }

                tempData[userId] = tempData[userId] || {};
                tempData[userId].nombre = nombre;
                console.log('✅ [flowInicio] Nombre guardado en tempData:', tempData[userId]);

                await flowDynamic(`Perfecto *${nombre}*! 🚀 Para finalizar el *registro*.`);
            } catch (err) {
                console.error("❌ [flowInicio] Error capturando nombre:", err);
                if (err && err.stack) {
                    console.error("❌ [flowInicio] Stack trace:", err.stack);
                }
            }
        }
    )
    .addAnswer(
        "✉️ Escribe tu *correo electrónico*:",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            const correo = ctx.body?.trim().toLowerCase();
            const rawUserId = ctx.from;
            const userId = rawUserId.split('@')[0]; // Normalizar

            console.log('📧 [flowInicio] Capturando correo...');
            console.log('📧 [flowInicio] Usuario ID:', userId);
            console.log('📧 [flowInicio] Correo recibido:', correo);

            if (!correo || !correo.includes("@") || !correo.includes(".")) {
                console.log('⚠️ [flowInicio] Correo inválido');
                await flowDynamic("⚠️ El correo no es válido. Por favor, escribe un correo electrónico válido (ejemplo: nombre@email.com).");
                return;
            }

            try {
                const nombre = tempData[userId]?.nombre;
                console.log('🔍 [flowInicio] Nombre recuperado de tempData:', nombre);

                if (!nombre) {
                    console.error('❌ [flowInicio] Nombre no encontrado en tempData');
                    console.error('❌ [flowInicio] tempData actual:', JSON.stringify(tempData, null, 2));
                    await flowDynamic("⚠️ No se encontró tu nombre. Por favor, escribe *hola* para comenzar de nuevo.");
                    return;
                }

                console.log('💾 [flowInicio] Guardando usuario en DB...');
                console.log('💾 [flowInicio] Datos:', { nombre, telefono: userId, correo });

                await saveUser({ nombre, telefono: userId, correo });

                delete tempData[userId];
                console.log('✅ [flowInicio] Usuario guardado y tempData limpiado');

                await flowDynamic(`¡Gracias, *${nombre}*! 🎉 Ahora estás registrado con el correo *${correo}*.`);
                
                console.log('🔍 [flowInicio] Redirigiendo al menú...');
                return gotoFlow(menuFlow);
            } catch (err) {
                console.error("❌ [flowInicio] Error guardando usuario:", err);
                if (err && err.stack) {
                    console.error("❌ [flowInicio] Stack trace:", err.stack);
                }
                await flowDynamic("⚠️ Hubo un problema al guardar tus datos. Por favor, inténtalo más tarde.");
            }
        }
    );

module.exports = flowInicio;