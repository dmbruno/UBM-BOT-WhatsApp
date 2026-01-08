const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const { getUserByPhone } = require('../utils/utils');
const menuFlow = require('./menu');
const flowRegistro = require('./registro');

// FLUJO IDLE - Captura TODOS los mensajes que no matchean ningún keyword
const flowIdle = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {
        console.log('========================================');
        console.log('⚡ [flowIdle] MENSAJE NO RECONOCIDO - PROCESANDO');
        console.log('⚡ [flowIdle] ctx.from:', ctx.from);
        console.log('⚡ [flowIdle] ctx.body:', ctx.body);
        console.log('========================================');
        
        try {
            const mensaje = ctx.body?.toLowerCase().trim();
            console.log('⚡ [flowIdle] Mensaje normalizado:', mensaje);
            
            // Si el mensaje es "hola", "hello", "buenas", "menu" o "inicio"
            if (['hola', 'hello', 'buenas', 'menu', 'inicio'].includes(mensaje)) {
                console.log('⚡ [flowIdle] Palabra clave detectada:', mensaje);
                
                const userId = ctx.from ? ctx.from.split('@')[0] : null;
                console.log('⚡ [flowIdle] Usuario ID:', userId);
                
                if (!userId) {
                    console.error('⚡ [flowIdle] NO HAY userId');
                    return;
                }
                
                // Verificar si el usuario existe
                const user = await getUserByPhone(userId);
                console.log('⚡ [flowIdle] Usuario en BD:', user ? 'SÍ' : 'NO');
                
                await flowDynamic('👋 ¡Bienvenido a *UBM Viajes*!');
                
                if (user) {
                    const primerNombre = user.nombre.split(' ')[0];
                    await flowDynamic(`Hola *${primerNombre}*! ¿En qué podemos ayudarte hoy?`);
                    console.log('⚡ [flowIdle] Redirigiendo a menuFlow...');
                    return gotoFlow(menuFlow);
                }
                
                // Usuario nuevo
                console.log('⚡ [flowIdle] Usuario NUEVO - Redirigiendo a registro...');
                return gotoFlow(flowRegistro);
            }
            
            console.log('⚡ [flowIdle] Mensaje no es palabra clave, ignorando');
            
        } catch (err) {
            console.error('❌ [flowIdle] ERROR:', err);
            console.error('❌ [flowIdle] Stack:', err?.stack);
        }
    });

module.exports = flowIdle;
