const { addKeyword , EVENTS} = require('@bot-whatsapp/bot');
const flowVip = require('./enjoy15/flowVip'); // Flujo para la opción VIP
const flowPremium = require('./enjoy15/flowPremium'); // Flujo para la opción Premium
const flowClassic = require('./enjoy15/flowClassic'); // Flujo para la opción Classic
const flowWeek = require('./enjoy15/flowWeek'); // Flujo para la opción Week

// Objeto global para almacenar datos temporales de contexto
const tempData = {};

const flowTus15 = addKeyword(EVENTS.ACTION) // Activa el flujo con la opción 7
    .addAction(async (ctx, { flowDynamic }) => {
        const userId = ctx.from;

        // Establecer el contexto del flujo para el usuario
        tempData[userId] = tempData[userId] || {};
        tempData[userId].context = 'flowTus15'; // Asignar el contexto
        console.log(`🔍 [flowTus15] Contexto asignado al usuario: ${userId}`);
    })
    .addAnswer(
        "🌟 *Tus 15 con UBM* 💃🌎\n\n" +
        "¿Querés vivir una experiencia única de la mano de UBM? Mira las opciones que tenemos para vos:\n\n" +
        "1️⃣ *VIP*: 20 días y 17 noches 🌟\n" +
        "2️⃣ *Premium*: 17 días y 14 noches ✨\n" +
        "3️⃣ *Classic*: 14 días y 11 noches 🏖️\n" +
        "4️⃣ *Week*: 10 días y 7 noches 🕶️\n\n" +
        "✍️ *Escribe el número de la opción que te interesa* para recibir más información.",
        { capture: true },
        async (ctx, { gotoFlow, flowDynamic }) => {
            const userId = ctx.from;

            // Validar si el usuario está en el contexto correcto
            if (tempData[userId]?.context !== 'flowTus15') {
                console.log(`⚠️ [flowTus15] Usuario fuera de contexto: ${userId}`);
                return await flowDynamic(
                    "⚠️ Parece que estás fuera de contexto. Escribe *menu* para volver al inicio."
                );
            }

            const input = ctx.body.trim().toUpperCase(); // Convertir la entrada del usuario a mayúsculas
            console.log(`🔍 [flowTus15] Entrada del usuario: ${input}`);

            // Validar si la entrada es una opción válida
            if (!["1", "2", "3", "4"].includes(input)) {
                return await flowDynamic(
                    "⚠️ Respuesta no válida. Por favor, escribe la letra de una de las opciones: A, B, C o D."
                );
            }

            // Redirigir al flujo correspondiente según la opción seleccionada
            switch (input) {
                case "1":
                    console.log("➡️ [flowTus15] Redirigiendo al flujo VIP...");
                    delete tempData[userId]; // Limpiar contexto
                    return gotoFlow(flowVip);
                case "2":
                    console.log("➡️ [flowTus15] Redirigiendo al flujo Premium...");
                    delete tempData[userId]; // Limpiar contexto
                    return gotoFlow(flowPremium);
                case "3":
                    console.log("➡️ [flowTus15] Redirigiendo al flujo Classic...");
                    delete tempData[userId]; // Limpiar contexto
                    return gotoFlow(flowClassic);
                case "4":
                    console.log("➡️ [flowTus15] Redirigiendo al flujo Week...");
                    delete tempData[userId]; // Limpiar contexto
                    return gotoFlow(flowWeek);
            }
        }
    )
    .addAnswer(
        "✨Si necesitas algo más, escribe *menu* para volver al inicio.",
        { capture: false },
        async (ctx) => {
            const userId = ctx.from;
            delete tempData[userId]; // Limpiar contexto al finalizar el flujo
            console.log(`🧹 [flowTus15] Contexto limpiado para el usuario: ${userId}`);
        }
    );

module.exports = flowTus15;