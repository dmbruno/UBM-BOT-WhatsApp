const { addKeyword } = require('@bot-whatsapp/bot');
const { getUserByPhone } = require('../utils/utils'); // Función para obtener usuario por teléfono
const flowFormula1 = require('./formula1');
const flowMundialClubes = require('./mundialClubes');

const flowNovedades = addKeyword(['novedades', 'noticias', 'eventos'])
    .addAction(async (ctx, { flowDynamic }) => {
        const userId = ctx.from;

        // Obtener información del usuario
        let userName = "Cliente"; // Valor por defecto
        try {
            const user = await getUserByPhone(userId);
            if (user) {
                userName = user.nombre;
            }
        } catch (error) {
            console.error("Error obteniendo el usuario:", error.message);
        }

        // Enviar saludo personalizado
        
    })
    .addAnswer(
        "Por favor, selecciona una opción:\n\n" +
        "1️⃣ *Fórmula 1* 🏎️\n" +
        "2️⃣ *Mundial de Clubes* ⚽\n\n" +
        "Escribe el número correspondiente para más información.",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            const input = ctx.body.trim();

            if (input === "1") {
                return gotoFlow(flowFormula1);
            } else if (input === "2") {
                return gotoFlow(flowMundialClubes);
            } else {
                await flowDynamic("⚠️ Respuesta no válida. Por favor, selecciona una opción escribiendo 1 o 2.");
            }
        }
    );

module.exports = flowNovedades;