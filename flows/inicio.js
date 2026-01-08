const { addKeyword } = require('@bot-whatsapp/bot');
const { getUserByPhone, saveUser } = require('../utils/utils');
const menuFlow = require('./menu');

// Variable global temporal para almacenar datos
const tempData = {};

const flowInicio = addKeyword(['hola', 'hello', 'buenas', 'menu', 'inicio'])
    .addAnswer(
        "👋 ¡Hola! Bienvenido a *UBM Viajes*",
        null,
        async (ctx, { flowDynamic, gotoFlow, endFlow }) => {
            console.log('🎬 [flowInicio] Inicio');
            
            try {
                const userId = ctx.from ? ctx.from.split('@')[0] : null;
                console.log('🔍 [flowInicio] Usuario:', userId);
                
                if (!userId) {
                    console.error('❌ [flowInicio] userId indefinido');
                    return endFlow();
                }
                
                const user = await getUserByPhone(userId);
                console.log('🔍 [flowInicio] BD:', user ? user.nombre : 'No encontrado');

                if (user) {
                    console.log('✅ [flowInicio] Usuario registrado');
                    await flowDynamic(`¡Hola *${user.nombre}*! 👋`);
                    await flowDynamic("Escribe *menu* para ver las opciones disponibles.");
                    return endFlow(); // Terminar aquí, NO continuar al siguiente addAnswer
                }
                
                // Usuario nuevo - NO HACER RETURN, dejar que continúe al siguiente addAnswer
                console.log('⚠️ [flowInicio] Nuevo usuario, iniciar registro');
                tempData[userId] = {};
                await flowDynamic("👤 Parece que eres nuevo aquí. Te voy a pedir unos datos para registrarte.");
                // NO hacer return ni endFlow() - el flujo DEBE continuar
                
            } catch (err) {
                console.error("❌ [flowInicio] Error:", err?.message || err);
                return endFlow();
            }
        }
    )
    .addAnswer(
        "✏️ Escribe tu *nombre completo*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log('📝 [flowInicio] Captura nombre');
            
            try {
                const nombre = ctx.body?.trim();
                const userId = ctx.from ? ctx.from.split('@')[0] : null;

                console.log('📝 Nombre:', nombre);

                if (!nombre || nombre.length < 2) {
                    await flowDynamic("⚠️ Por favor, ingresa un nombre válido.");
                    return;
                }

                tempData[userId] = tempData[userId] || {};
                tempData[userId].nombre = nombre;
                console.log('✅ [flowInicio] Nombre guardado');

                await flowDynamic(`Perfecto *${nombre}*! 🚀`);
            } catch (err) {
                console.error("❌ [flowInicio] Error nombre:", err?.message);
            }
        }
    )
    .addAnswer(
        "✉️ Escribe tu *correo electrónico*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log('📧 [flowInicio] Captura correo');
            
            try {
                const correo = ctx.body?.trim().toLowerCase();
                const userId = ctx.from ? ctx.from.split('@')[0] : null;

                console.log('📧 Correo:', correo);

                if (!correo || !correo.includes("@") || !correo.includes(".")) {
                    await flowDynamic("⚠️ El correo no es válido. Ejemplo: nombre@email.com");
                    return;
                }

                const nombre = tempData[userId]?.nombre;

                if (!nombre) {
                    console.error('❌ [flowInicio] Nombre no encontrado');
                    await flowDynamic("⚠️ Escribe *hola* para comenzar de nuevo.");
                    return;
                }

                console.log('💾 [flowInicio] Guardando...');
                await saveUser({ nombre, telefono: userId, correo });

                delete tempData[userId];
                console.log('✅ [flowInicio] Usuario guardado');

                await flowDynamic(`¡Gracias, *${nombre}*! 🎉 Ya estás registrado.`);
                await flowDynamic("Escribe *menu* para ver las opciones disponibles.");
                
            } catch (err) {
                console.error("❌ [flowInicio] Error correo:", err?.message);
                await flowDynamic("⚠️ Hubo un problema. Escribe *hola* para reintentar.");
            }
        }
    );

module.exports = flowInicio;
