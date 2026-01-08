const { addKeyword } = require('@bot-whatsapp/bot');
const { saveUser } = require('../utils/utils');
const menuFlow = require('./menu');

// Variable temporal para almacenar datos durante el registro
const tempData = {};

const flowRegistro = addKeyword('__REGISTRO_INTERNO__')
    .addAnswer(
        "Antes de continuar, necesitamos algunos datos.\nPor favor, escribe tu *nombre completo*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            try {
                const nombre = ctx.body?.trim();
                const userId = ctx.from ? ctx.from.split('@')[0] : null;

                if (!nombre || nombre.length < 2) {
                    await flowDynamic("⚠️ Ingresa un nombre válido:");
                    return;
                }

                tempData[userId] = tempData[userId] || {};
                tempData[userId].nombre = nombre;
                
            } catch (err) {
                console.error("[flowRegistro] Error capturando nombre:", err.message);
            }
        }
    )
    .addAnswer(
        "Perfecto! Ahora tu *correo electrónico*:",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            try {
                const correo = ctx.body?.trim();
                const userId = ctx.from ? ctx.from.split('@')[0] : null;

                if (!correo || !correo.includes('@')) {
                    await flowDynamic("⚠️ Ingresa un correo válido:");
                    return;
                }

                // Recuperar nombre guardado
                const nombre = tempData[userId]?.nombre;
                
                if (!nombre) {
                    await flowDynamic("⚠️ Hubo un error. Por favor, escribe *hola* para comenzar de nuevo.");
                    delete tempData[userId];
                    return;
                }

                // Guardar en base de datos
                await saveUser(userId, nombre, correo);
                
                // Limpiar datos temporales
                delete tempData[userId];
                
                const primerNombre = nombre.split(' ')[0];
                await flowDynamic(`✅ ¡Gracias *${primerNombre}*! Te has registrado exitosamente.`);
                
                // Ir al menú
                return gotoFlow(menuFlow);
                
            } catch (err) {
                console.error("[flowRegistro] Error guardando usuario:", err.message);
                await flowDynamic("⚠️ Hubo un error al registrar tus datos. Intenta nuevamente escribiendo *hola*.");
            }
        }
    );

module.exports = flowRegistro;
