const { addKeyword } = require('@bot-whatsapp/bot');
const path = require('path');
const fs = require('fs');

const flowUbicacion = addKeyword(['ubicacion', 'ubicación'])
    .addAction(async (ctx, { flowDynamic }) => {
        try {
            // Ruta al archivo ubicacion.txt
            const ubicacionPath = path.join(__dirname, '../mensajes', 'ubicacion.txt');

            // Leer el contenido del archivo de manera síncrona
            const ubicacionContent = fs.readFileSync(ubicacionPath, 'utf8');

            // Enviar el contenido como un solo mensaje
            await flowDynamic(ubicacionContent);
        } catch (error) {
            console.error('Error al leer ubicacion.txt:', error);
            await flowDynamic('Lo siento, hubo un problema para obtener la información de ubicación.');
        }
    });

module.exports = flowUbicacion;