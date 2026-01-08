const { addKeyword } = require('@bot-whatsapp/bot');

const flowTest = addKeyword(['test', 'prueba'])
    .addAnswer('✅ ¡El bot está funcionando!');

module.exports = flowTest;
