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
            console.log('🎬 [flowInicio] ========================================');
            console.log('🎬 [flowInicio] FUNCIÓN PRINCIPAL EJECUTÁNDOSE');
            console.log('🎬 [flowInicio] ========================================');
            
            try {
                // Normalizar el userId (remover @lid, @s.whatsapp.net, etc.)
                const rawUserId = ctx.from;
                const userId = rawUserId ? rawUserId.split('@')[0] : 'UNKNOWN';
                
                console.log('🔍 [flowInicio] ======== INICIO DEL FLUJO ========');
                console.log('🔍 [flowInicio] Raw User ID:', rawUserId);
                console.log('🔍 [flowInicio] Normalized User ID:', userId);
                console.log('🔍 [flowInicio] Mensaje recibido:', ctx.body);
                console.log('🔍 [flowInicio] Contexto keys:', Object.keys(ctx));
                
                if (!userId || userId === 'UNKNOWN') {
                    console.error('❌ [flowInicio] ERROR: userId es undefined');
                    await flowDynamic("⚠️ No se pudo identificar tu número. Por favor, intenta de nuevo.");
                    return;
                }
                
                console.log('🔍 [flowInicio] Intentando buscar usuario en DB...');
                const user = await getUserByPhone(userId);
                console.log('🔍 [flowInicio] Resultado de búsqueda:', user);

                if (user) {
                    console.log('✅ [flowInicio] Usuario encontrado:', user.nombre);
                    console.log('📤 [flowInicio] Enviando saludo personalizado...');
                    await flowDynamic(`¡Hola *${user.nombre}*! 👋 ¿En qué puedo ayudarte hoy?`);
                    console.log('✅ [flowInicio] Saludo enviado correctamente');
                    console.log('� [flowInicio] Redirigiendo al menú...');
                    return gotoFlow(menuFlow);
                } else {
                    console.log('⚠️ [flowInicio] Usuario NO encontrado, iniciando registro...');
                    tempData[userId] = {};
                    console.log('🔍 [flowInicio] tempData inicializado para:', userId);
                    console.log('📤 [flowInicio] Enviando mensaje de bienvenida...');
                    
                    const resultado = await flowDynamic("👤 Parece que eres nuevo aquí. Te voy a pedir unos datos para *registrarte*.");
                    console.log('✅ [flowInicio] Mensaje de bienvenida enviado:', resultado);
                    console.log('➡️ [flowInicio] Continuando al siguiente addAnswer...');
                    // NO hacemos return, el flujo continúa al siguiente addAnswer
                }
                
                console.log('✅ [flowInicio] Función principal completada sin errores');
            } catch (err) {
                console.error("❌❌❌ [flowInicio] ERROR CRÍTICO EN FUNCIÓN PRINCIPAL ❌❌❌");
                console.error("❌ [flowInicio] Tipo de error:", typeof err);
                console.error("❌ [flowInicio] Error:", err);
                console.error("❌ [flowInicio] Error message:", err?.message);
                console.error("❌ [flowInicio] Error completo:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
                if (err && err.stack) {
                    console.error("❌ [flowInicio] Stack trace:", err.stack);
                }
                
                try {
                    await flowDynamic("⚠️ Hubo un problema procesando tu solicitud. Por favor, inténtalo más tarde.");
                } catch (flowErr) {
                    console.error("❌ [flowInicio] Error al enviar mensaje de error:", flowErr);
                }
            }
            
            console.log('🏁 [flowInicio] Fin de función principal');
        }
    )
    .addAnswer(
        "✏️ Escribe tu *nombre completo*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            console.log('📝📝📝 [flowInicio] ========================================');
            console.log('📝 [flowInicio] CAPTURA DE NOMBRE INICIADA');
            console.log('📝📝📝 [flowInicio] ========================================');
            
            try {
                const nombre = ctx.body?.trim();
                const rawUserId = ctx.from;
                const userId = rawUserId ? rawUserId.split('@')[0] : 'UNKNOWN';

                console.log('📝 [flowInicio] Usuario ID:', userId);
                console.log('📝 [flowInicio] Nombre recibido:', nombre);
                console.log('📝 [flowInicio] Longitud del nombre:', nombre?.length);

                if (!nombre || nombre.length < 2) {
                    console.log('⚠️ [flowInicio] Nombre inválido o muy corto');
                    await flowDynamic("⚠️ Por favor, ingresa un nombre válido.");
                    return;
                }

                tempData[userId] = tempData[userId] || {};
                tempData[userId].nombre = nombre;
                console.log('✅ [flowInicio] Nombre guardado en tempData:', tempData[userId]);
                console.log('📝 [flowInicio] tempData completo:', JSON.stringify(tempData, null, 2));

                console.log('📤 [flowInicio] Enviando confirmación de nombre...');
                await flowDynamic(`Perfecto *${nombre}*! 🚀 Para finalizar el *registro*.`);
                console.log('✅ [flowInicio] Confirmación enviada correctamente');
            } catch (err) {
                console.error("❌❌❌ [flowInicio] ERROR EN CAPTURA DE NOMBRE ❌❌❌");
                console.error("❌ [flowInicio] Error:", err);
                console.error("❌ [flowInicio] Error message:", err?.message);
                if (err && err.stack) {
                    console.error("❌ [flowInicio] Stack trace:", err.stack);
                }
                
                try {
                    await flowDynamic("⚠️ Hubo un error. Por favor, escribe *hola* para comenzar de nuevo.");
                } catch (flowErr) {
                    console.error("❌ [flowInicio] Error al enviar mensaje de error:", flowErr);
                }
            }
            
            console.log('🏁 [flowInicio] Fin de captura de nombre');
        }
    )
    .addAnswer(
        "✉️ Escribe tu *correo electrónico*:",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            console.log('📧📧📧 [flowInicio] ========================================');
            console.log('📧 [flowInicio] CAPTURA DE CORREO INICIADA');
            console.log('📧📧📧 [flowInicio] ========================================');
            
            try {
                const correo = ctx.body?.trim().toLowerCase();
                const rawUserId = ctx.from;
                const userId = rawUserId ? rawUserId.split('@')[0] : 'UNKNOWN';

                console.log('📧 [flowInicio] Usuario ID:', userId);
                console.log('📧 [flowInicio] Correo recibido:', correo);

                if (!correo || !correo.includes("@") || !correo.includes(".")) {
                    console.log('⚠️ [flowInicio] Correo inválido');
                    await flowDynamic("⚠️ El correo no es válido. Por favor, escribe un correo electrónico válido (ejemplo: nombre@email.com).");
                    return;
                }

                const nombre = tempData[userId]?.nombre;
                console.log('🔍 [flowInicio] Nombre recuperado de tempData:', nombre);
                console.log('🔍 [flowInicio] tempData completo:', JSON.stringify(tempData, null, 2));

                if (!nombre) {
                    console.error('❌ [flowInicio] Nombre no encontrado en tempData');
                    await flowDynamic("⚠️ No se encontró tu nombre. Por favor, escribe *hola* para comenzar de nuevo.");
                    return;
                }

                console.log('💾 [flowInicio] Guardando usuario en DB...');
                console.log('💾 [flowInicio] Datos:', { nombre, telefono: userId, correo });

                await saveUser({ nombre, telefono: userId, correo });

                delete tempData[userId];
                console.log('✅ [flowInicio] Usuario guardado y tempData limpiado');

                console.log('📤 [flowInicio] Enviando mensaje de confirmación...');
                await flowDynamic(`¡Gracias, *${nombre}*! 🎉 Ahora estás registrado con el correo *${correo}*.`);
                console.log('✅ [flowInicio] Mensaje de confirmación enviado');
                
                console.log('� [flowInicio] Redirigiendo al menú...');
                return gotoFlow(menuFlow);
            } catch (err) {
                console.error("❌❌❌ [flowInicio] ERROR EN CAPTURA DE CORREO ❌❌❌");
                console.error("❌ [flowInicio] Error:", err);
                console.error("❌ [flowInicio] Error message:", err?.message);
                if (err && err.stack) {
                    console.error("❌ [flowInicio] Stack trace:", err.stack);
                }
                
                try {
                    await flowDynamic("⚠️ Hubo un problema al guardar tus datos. Por favor, inténtalo más tarde.");
                } catch (flowErr) {
                    console.error("❌ [flowInicio] Error al enviar mensaje de error:", flowErr);
                }
            }
            
            console.log('🏁 [flowInicio] Fin de captura de correo');
        }
    );

module.exports = flowInicio;