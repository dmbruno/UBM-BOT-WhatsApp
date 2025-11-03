const { addKeyword , EVENTS } = require('@bot-whatsapp/bot');
// Flujos anteriores (comentados - no se usan actualmente)
// const flowAndalucia = require('./flowAndalucia'); // Flujo para Andalucía, Madrid y Portugal
// const flowItalia = require('./flowItalia'); // Flujo para Italia
// const flowTesoros = require('./flowTesoros');
// const flowInglaterra = require('./flowInglaterra');

// Nuevos flujos actualizados 2026
const flowAventuraIberica = require('./flowAventuraIberica');
const flowCoreaJapon = require('./flowCoreaJapon');
const flowDescubreItalia = require('./flowDescubreItalia');
const flowTurquiaDubai = require('./flowTurquiaDubai');

// Objeto global para almacenar datos temporales de contexto
const tempData = {};

const europaFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic }) => {
        const userId = ctx.from;

        // Establecer el contexto del flujo para el usuario
        tempData[userId] = tempData[userId] || {};
        tempData[userId].context = 'europaFlow';
        console.log(`🔍 [europaFlow] Contexto asignado al usuario: ${userId}`);
    })
    .addAnswer(
        "🌍 *Salidas Grupales - Europa* 🌟\n\n" +
        "¡Descubrí los destinos más fascinantes con nuestras opciones exclusivas! Elegí la opción que más te interese:\n\n" +
        "1️⃣ *Aventura Ibérica* 🇪🇸🇵🇹\n" +
        "   Madrid, Andalucía, Portugal y muchos más...\n\n" +
        "2️⃣ *Corea y Japón* 🇰🇷🇯🇵\n" +
        "   Seúl, Tokio, Kioto y muchos más...\n\n" +
        "3️⃣ *Descubre Italia* 🇮🇹\n" +
        "   Milán, Venecia, Roma y muchos más...\n\n" +
        "4️⃣ *Turquía y Dubái* 🇹🇷🇦🇪\n" +
        "   Estambul, Capadocia, Dubái y muchos más...\n\n" +
        "✍️ *Escribe el número de la opción que te interesa* para recibir más información.",
        { capture: true },
        async (ctx, { gotoFlow, flowDynamic }) => {
            const userId = ctx.from;

            // Validar si el usuario está en el contexto correcto
            if (tempData[userId]?.context !== 'europaFlow') {
                console.log(`⚠️ [europaFlow] Usuario fuera de contexto: ${userId}`);
                return await flowDynamic(
                    "⚠️ Parece que estás fuera de contexto. Escribe *europa* para volver a iniciar este flujo."
                );
            }

            const input = ctx.body.trim();
            console.log(`🔍 [europaFlow] Entrada del usuario: ${input}`);

            // Validar si la entrada es una opción válida
            if (!["1", "2", "3", "4"].includes(input)) {
                return await flowDynamic(
                    "⚠️ Respuesta no válida. Por favor, escribe el número de una de las opciones: 1️⃣, 2️⃣, 3️⃣ o 4️⃣."
                );
            }

            // Responder según la opción seleccionada
            switch (input) {
                case "1":
                    console.log("➡️ [europaFlow] Usuario eligió Aventura Ibérica.");
                    return  gotoFlow(flowAventuraIberica);

                case "2":
                     console.log("➡️ [europaFlow] Usuario eligió Corea y Japón.");
                     return gotoFlow(flowCoreaJapon);

                case "3":
                     console.log("➡️ [europaFlow] Usuario eligió Descubre Italia.");
                     return gotoFlow(flowDescubreItalia);

                 case "4":
                     console.log("➡️ [europaFlow] Usuario eligió Turquía y Dubái.");
                     return gotoFlow(flowTurquiaDubai);
            }
        }
    )
    .addAnswer(
        "✨Si necesitas algo más, escribe *menu* para volver al inicio.",
        { capture: false },
        async (ctx) => {
            const userId = ctx.from;
            delete tempData[userId];
            console.log(`🧹 [europaFlow] Contexto limpiado para el usuario: ${userId}`);
        }
    );

module.exports = europaFlow;