const { addKeyword } = require('@bot-whatsapp/bot');
const { getUserByPhone } = require('../utils/utils');
const menuFlow = require('./menu');
const flowRegistro = require('./registro');

const flowInicio = addKeyword(['hola', 'hello', 'buenas', 'menu', 'inicio'], { sensitive: false })
    .addAnswer(
        '👋 ¡Bienvenido a *UBM Viajes*!',
        null,
        async (ctx, { flowDynamic, gotoFlow }) => {
            try {
                const userId = ctx.from ? ctx.from.split('@')[0] : null;
                
                if (!userId) {
                    console.error('[flowInicio] Error: No se pudo obtener el ID del usuario');
                    return;
                }
                
                const user = await getUserByPhone(userId);

                if (user) {
                    // Usuario registrado - saludo personalizado
                    const primerNombre = user.nombre.split(' ')[0];
                    await flowDynamic(`Hola *${primerNombre}*! ¿En qué podemos ayudarte hoy?`);
                    return gotoFlow(menuFlow);
                }
                
                // Usuario nuevo - ir a registro
                return gotoFlow(flowRegistro);
                
            } catch (err) {
                console.error("[flowInicio] Error:", err.message);
            }
        }
    );

module.exports = flowInicio;
