const { addKeyword } = require('@bot-whatsapp/bot');
const flowMexico = require('./flowMexico'); // Flujo para Asia
const flowUsa = require('./flowUsa'); // Flujo para Europa
const flowAsia = require('./flowAsia');
const flowEspanaPortugalMarruecos = require('./flowEspanaPortugalMarruecos');
// const flowOceania = require('./flowOceania'); // Flujo para Oceanía
// const flowAmerica = require('./flowAmerica'); // Flujo para América del Norte y del Sur

// Objeto global para almacenar datos temporales de contexto
const tempData = {};

const restoDelMundoFlow = addKeyword(["resto del mundo", "ubm/ola resto del mundo"]) // Palabras clave para activar el flujo
    .addAction(async (ctx, { flowDynamic }) => {
        const userId = ctx.from;

        // Establecer el contexto del flujo para el usuario
        tempData[userId] = tempData[userId] || {};
        tempData[userId].context = 'restoDelMundoFlow'; // Asignar el contexto
        console.log(`🔍 [restoDelMundoFlow] Contexto asignado al usuario: ${userId}`);
    })
    .addAnswer(
        "🌍 *Salidas Grupales - Resto del Mundo* 🌟\n\n" +
        "¡Descubre destinos únicos y emocionantes por todo el mundo! Elige la opción que más te interese:\n\n" +
        "1️⃣ *México: Experiencia Única en CDMX* 🇲🇽\n" +
        "2️⃣ *USA: Grandes Ciudades y Paisajes Naturales* 🇺🇸\n" +
        "3️⃣ *Asia: Grandes ciudades y templos milenarios* 🌏\n" +
        "4️⃣ *España, Portugal y Marruecos: Un viaje lleno de cultura y encanto* 🇪🇸🇵🇹🇲🇦\n\n" +
        "✍️ *Escribe el número de la opción que te interesa* para recibir más información.",
        { capture: true },
        async (ctx, { gotoFlow, flowDynamic }) => {
            const userId = ctx.from;

            // Validar si el usuario está en el contexto correcto
            if (tempData[userId]?.context !== 'restoDelMundoFlow') {
                console.log(`⚠️ [restoDelMundoFlow] Usuario fuera de contexto: ${userId}`);
                return await flowDynamic(
                    "⚠️ Parece que estás fuera de contexto. Escribe *resto del mundo* para volver a iniciar este flujo."
                );
            }

            const input = ctx.body.trim(); // Capturar entrada del usuario
            console.log(`🔍 [restoDelMundoFlow] Entrada del usuario: ${input}`);

            // Validar si la entrada es una opción válida
            if (!["1", "2", "3", "4"].includes(input)) {
                return await flowDynamic(
                    "⚠️ Respuesta no válida. Por favor, escribe el número de una de las opciones: 1️⃣, 2️⃣, 3️⃣ o 4️⃣."
                );
            }

            // Responder según la opción seleccionada
            switch (input) {
                case "1":
                    console.log("➡️ [restoDelMundoFlow] Usuario eligió Mexico.");
                    return gotoFlow(flowMexico);

                case "2":
                     console.log("➡️ [restoDelMundoFlow] Usuario eligió Usa.");
                     return gotoFlow(flowUsa);

                case "3":
                     console.log("➡️ [restoDelMundoFlow] Usuario eligió Asia.");
                     return gotoFlow(flowAsia);

                case "4":
                     console.log("➡️ [restoDelMundoFlow] Usuario eligió ESP/POR/MAR.");
                     return gotoFlow(flowEspanaPortugalMarruecos);
            }
        }
    )
    .addAnswer(
        "✨Si necesitas algo más, escribe *menu* para volver al inicio.",
        { capture: false },
        async (ctx) => {
            const userId = ctx.from;
            delete tempData[userId]; // Limpiar contexto al finalizar el flujo
            console.log(`🧹 [restoDelMundoFlow] Contexto limpiado para el usuario: ${userId}`);
        }
    );

module.exports = restoDelMundoFlow;