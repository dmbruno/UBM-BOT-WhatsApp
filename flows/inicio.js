const { addKeyword } = require('@bot-whatsapp/bot');
const { getUserByPhone, saveUser } = require('../utils/utils');
const menuFlow = require('./menu'); // Importamos el menú principal

// Variable global temporal para almacenar datos
const tempData = {};

const flowInicio = addKeyword(['hola', 'hello', 'buenas'])
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {
        const userId = ctx.from; // Número de teléfono del usuario
        try {
            // Verificar si el usuario ya está en la base de datos
            const user = await getUserByPhone(userId);

            if (user) {
                // Si el usuario existe, lo saludamos y mostramos el menú principal
                await flowDynamic(`¡Hola *${user.nombre}*! 👋 ¿En qué puedo ayudarte hoy?`);
                return gotoFlow(menuFlow); // Redirige al menú principal directamente
            } else {
                // Si el usuario no existe, inicializamos la sesión y empezamos el registro
                ctx.session = ctx.session || {};
                tempData[userId] = {}; // Inicializamos datos temporales
                await flowDynamic("👤 Parece que eres nuevo aquí. Te voy a pedir unos datos para *registrarte*.");
            }
        } catch (err) {
            console.error("Error en el flujo de inicio:", err.message);
            await flowDynamic("⚠️ Hubo un problema procesando tu solicitud. Por favor, inténtalo más tarde.");
        }
    })
    .addAnswer(
        "✏️ Escribe tu *nombre completo*:",
        { capture: true },
        async (ctx, { flowDynamic }) => {
            const nombre = ctx.body?.trim();
            const userId = ctx.from;

            if (!nombre) {
                await flowDynamic("⚠️ Por favor, ingresa un nombre válido.");
                return;
            }

            // Guardar el nombre temporalmente en la sesión o en datos temporales
            ctx.session = ctx.session || {};
            ctx.session.nombre = nombre;
            tempData[userId].nombre = nombre;

            await flowDynamic("🚀 Para finalizar el *registro*.");
        }
    )
    .addAnswer(
        "✉️ Escribe tu *correo electrónico*:",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            const correo = ctx.body?.trim();
            const userId = ctx.from;

            if (!correo || !correo.includes("@")) {
                await flowDynamic("⚠️ El correo no es válido. Por favor, escribe un correo electrónico válido.");
                return;
            }

            try {
                // Recuperar nombre desde sesión o datos temporales
                const nombre = ctx.session?.nombre || tempData[userId]?.nombre;

                if (!nombre) {
                    await flowDynamic("⚠️ No se encontró tu nombre. Por favor, comienza de nuevo.");
                    return;
                }

                // Guardar usuario en la base de datos
                await saveUser({ nombre, telefono: userId, correo });

                // Limpiar datos temporales
                delete tempData[userId];

                await flowDynamic(`¡Gracias, *${nombre}*! 🎉 Ahora estás registrado con el correo *${correo}*.`);
                return gotoFlow(menuFlow); // Redirige al flujo de menú
            } catch (err) {
                console.error("Error guardando usuario:", err.message);
                await flowDynamic("⚠️ Hubo un problema al guardar tus datos. Por favor, inténtalo más tarde.");
            }
        }
    );

module.exports = flowInicio;