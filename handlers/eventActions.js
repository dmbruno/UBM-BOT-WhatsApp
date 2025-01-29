const { EVENT } = require('@bot-whatsapp/bot');
const flowVip = require('../flows/enjoy15/flowVip'); // Flujo VIP
const flowPremium = require('../flows/enjoy15/flowPremium'); // Flujo Premium
const flowClassic = require('../flows/enjoy15/flowClassic'); // Flujo Classic
const flowWeek = require('../flows/enjoy15/flowWeek'); // Flujo Week

const handleEventActions = (bot) => {
    bot.on(EVENT.ACTION, async (event) => {
        const { action, userId } = event;

        switch (action) {
            case 'redirect-to-vip':
                console.log(`🔀 Redirigiendo usuario ${userId} al flujo VIP`);
                return bot.gotoFlow(flowVip, { userId });

            case 'redirect-to-premium':
                console.log(`🔀 Redirigiendo usuario ${userId} al flujo Premium`);
                return bot.gotoFlow(flowPremium, { userId });

            case 'redirect-to-classic':
                console.log(`🔀 Redirigiendo usuario ${userId} al flujo Classic`);
                return bot.gotoFlow(flowClassic, { userId });

            case 'redirect-to-week':
                console.log(`🔀 Redirigiendo usuario ${userId} al flujo Week`);
                return bot.gotoFlow(flowWeek, { userId });

            case 'invalid-context':
                console.log(`⚠️ Usuario ${userId} fuera de contexto.`);
                return bot.sendMessage(userId, '⚠️ Parece que estás fuera del flujo. Escribe *menu* para volver al inicio.');

            case 'invalid-option':
                console.log(`⚠️ Usuario ${userId} ingresó una opción no válida.`);
                return bot.sendMessage(userId, '⚠️ Respuesta no válida. Por favor, selecciona una de las opciones.');

            default:
                console.log(`⚠️ Acción no manejada: ${action}`);
        }
    });
};

module.exports = handleEventActions;