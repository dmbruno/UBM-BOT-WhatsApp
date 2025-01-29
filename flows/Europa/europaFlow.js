const { addKeyword } = require('@bot-whatsapp/bot');
const flowAndalucia = require('./flowAndalucia'); // Flujo para Andalucía, Madrid y Portugal
const flowItalia = require('./flowItalia'); // Flujo para Italia
const flowTesoros = require('./flowTesoros');
const flowInglaterra = require('./flowInglaterra');


// Objeto global para almacenar datos temporales de contexto
const tempData = {};

const europaFlow = addKeyword(["europa", "ubm/ola europa"]) // Palabras clave para activar el flujo
    .addAction(async (ctx, { flowDynamic }) => {
        const userId = ctx.from;

        // Establecer el contexto del flujo para el usuario
        tempData[userId] = tempData[userId] || {};
        tempData[userId].context = 'europaFlow'; // Asignar el contexto
        console.log(`🔍 [europaFlow] Contexto asignado al usuario: ${userId}`);
    })
    .addAnswer(
        "🌍 *Salidas Grupales - Europa* 🌟\n\n" +
        "¡Descubrí los destinos más fascinantes de Europa con nuestras opciones exclusivas! Elegí la opción que más te interese:\n\n" +
        "1️⃣ *Andalucía/Madrid y Portugal* 🇪🇸🇵🇹\n" +
        "2️⃣ *Italia: Roma y Maravillas del Sur* 🇮🇹\n" +
        "3️⃣ *Tesoros del Adriático: Italia y Croacia* 🇮🇹🇭🇷\n" +
        "4️⃣ *Inglaterra/Escocia e Irlanda* 🇬🇧🇮🇪\n\n" +
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

            const input = ctx.body.trim(); // Capturar entrada del usuario
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
                    console.log("➡️ [europaFlow] Usuario eligió Andalucía/Madrid y Portugal.");
                    return  gotoFlow(flowAndalucia);

                case "2":
                     console.log("➡️ [europaFlow] Usuario eligió Italia: Roma y Maravillas del Sur.");
                     return gotoFlow(flowItalia);

                case "3":
                     console.log("➡️ [europaFlow] Usuario eligió Tesoros del Adriático.");
                     return gotoFlow(flowTesoros);

                 case "4":
                     console.log("➡️ [europaFlow] Usuario eligió Inglaterra/Escocia e Irlanda.");
                     return gotoFlow(flowInglaterra);
            }
        }
    )
    .addAnswer(
        "✨Si necesitas algo más, escribe *menu* para volver al inicio.",
        { capture: false },
        async (ctx) => {
            const userId = ctx.from;
            delete tempData[userId]; // Limpiar contexto al finalizar el flujo
            console.log(`🧹 [europaFlow] Contexto limpiado para el usuario: ${userId}`);
        }
    );

module.exports = europaFlow;