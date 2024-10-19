const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot');
require("dotenv").config();

const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
//const MongoAdapter = require('@bot-whatsapp/database/mongo');
//MONGO_DB_URI='mongodb+srv://dmbruno61:ZWuWnzVLAO3OS@ubm-bot.o2goq.mongodb.net/ubm_bot_db?retryWrites=true&w=majority&appName=Ubm-Bot'
//esto de arriba va en el .env en el caso de conectar la base de datos
const { delay } = require('@whiskeysockets/baileys');


const path = require('path');
const fs = require('fs');



// para leer el archivo menu.txt
const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf-8");




// Mensaje de Bienvenida
const flowPrincipal = addKeyword(['hola', 'hello','hi','quiero','buenas', 'buenos dias', 'buenos días'])
    .addAnswer('¡Hola! 👋 Soy el BOT de la Agencia 👋 Bienvenido a UBM - Viajes y Turismo. ¿En qué podemos ayudarte hoy?')
    .addAnswer('Escribe *Menu* para más opciones');




// Función para leer el archivo agentes.txt
const agentesPath = path.join(__dirname, "mensajes", "agentes.txt");



function getAgentesInfo() {
    return new Promise((resolve, reject) => {
        fs.readFile(agentesPath, 'utf-8', (err, data) => {
            if (err) {
                return reject('Error al leer la información de los agentes.');
            }
            resolve(data);
        });
    });
}




// flowUbicacion
const flowUbicacion = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic }) => {
        try {
            // Ruta al archivo ubicacion.txt
            const ubicacionPath = path.join(__dirname, 'mensajes', 'ubicacion.txt');

            // Leer el contenido del archivo de manera síncrona
            const ubicacionContent = fs.readFileSync(ubicacionPath, 'utf8');

            // Enviar el contenido como un solo mensaje
            await flowDynamic(ubicacionContent);
        } catch (error) {
            console.error('Error al leer ubicacion.txt:', error);
            await flowDynamic('Lo siento, hubo un problema para obtener la información de ubicación.');
        }
    });




// Objeto para almacenar los datos de los usuarios
const userSessions = {};

const flowConsultas = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx) => {
        const userId = ctx.from;
        userSessions[userId] = userSessions[userId] || { resumen: '' };
    })
    .addAnswer(
        "👥 ¿Cuántos pasajeros son?\nPor favor, indica el número de adultos y si hay menores con edades (0 a 11 años).",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            try {
                const input = ctx.body.trim().toLowerCase();

                if (input === 'menu') {
                    await flowDynamic("🔄 Has decidido volver al menú principal. Puedes retomar la cotización en cualquier momento.");
                    delete userSessions[ctx.from];
                    return gotoFlow(menuFlow); // Retornamos directamente gotoFlow
                }

                const userId = ctx.from;
                userSessions[userId].pasajeros = ctx.body;
                userSessions[userId].resumen += `👥 *Pasajeros:* ${ctx.body}\n`;
                console.log("Pasajeros capturados:", ctx.body);
            } catch (error) {
                console.error("Error capturando pasajeros:", error);
            }
        }
    )
    // Repite la misma lógica en cada addAnswer del flujo
    .addAnswer(
        "📅 Perfecto, ¿en qué mes o meses estarías disponible para viajar? (Ej: Enero, Febrero, etc.)",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            try {
                const input = ctx.body.trim().toLowerCase();

                if (input === 'menu') {
                    await flowDynamic("🔄 Has decidido volver al menú principal. Puedes retomar la cotización en cualquier momento.");
                    delete userSessions[ctx.from];
                    return gotoFlow(menuFlow);
                }

                const userId = ctx.from;
                userSessions[userId].mes = ctx.body;
                userSessions[userId].resumen += `📅 *Mes disponible:* ${ctx.body}\n`;
                console.log("Mes capturado:", ctx.body);
            } catch (error) {
                console.error("Error capturando mes:", error);
            }
        }
    )
    // Continúa aplicando esta modificación en cada paso del flujo
    .addAnswer(
        "⏳ ¿Cuántos días te gustaría viajar aproximadamente?",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            try {
                const input = ctx.body.trim().toLowerCase();

                if (input === 'menu') {
                    await flowDynamic("🔄 Has decidido volver al menú principal. Puedes retomar la cotización en cualquier momento.");
                    delete userSessions[ctx.from];
                    return gotoFlow(menuFlow);
                }

                const userId = ctx.from;
                userSessions[userId].dias = ctx.body;
                userSessions[userId].resumen += `⏳ *Duración:* ${ctx.body} días\n`;
                console.log("Días capturados:", ctx.body);
            } catch (error) {
                console.error("Error capturando días:", error);
            }
        }
    )
    .addAnswer(
        "🏨 ¿Qué tipo de servicio prefieres?\n\n1️⃣ All inclusive\n2️⃣ Solo desayuno\n3️⃣ Ambos combinados",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            try {
                const input = ctx.body.trim().toLowerCase();

                if (input === 'menu') {
                    await flowDynamic("🔄 Has decidido volver al menú principal. Puedes retomar la cotización en cualquier momento.");
                    delete userSessions[ctx.from];
                    return gotoFlow(menuFlow);
                }

                const userId = ctx.from;
                userSessions[userId].servicio = ctx.body;

                let servicioTexto = '';
                switch (ctx.body.trim()) {
                    case '1':
                        servicioTexto = 'All inclusive';
                        break;
                    case '2':
                        servicioTexto = 'Solo desayuno';
                        break;
                    case '3':
                        servicioTexto = 'Ambos combinados';
                        break;
                    default:
                        servicioTexto = ctx.body;
                }

                userSessions[userId].resumen += `🏨 *Servicio preferido:* ${servicioTexto}\n`;
                console.log("Servicio capturado:", servicioTexto);
            } catch (error) {
                console.error("Error capturando servicio:", error);
            }
        }
    )
    .addAnswer(
        "🌍 ¿Cuál es tu destino preferido? ¿Y si tienes una segunda opción?",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            try {
                const input = ctx.body.trim().toLowerCase();

                if (input === 'menu') {
                    await flowDynamic("🔄 Has decidido volver al menú principal. Puedes retomar la cotización en cualquier momento.");
                    delete userSessions[ctx.from];
                    return gotoFlow(menuFlow);
                }

                const userId = ctx.from;
                userSessions[userId].destino = ctx.body;
                userSessions[userId].resumen += `🌍 *Destino preferido:* ${ctx.body}\n`;
                console.log("Destino capturado:", ctx.body);
            } catch (error) {
                console.error("Error capturando destino:", error);
            }
        }
    )
    .addAnswer(
        "🚫 ¿Hay algún lugar que no te gustaría visitar?",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            try {
                const input = ctx.body.trim().toLowerCase();

                if (input === 'menu') {
                    await flowDynamic("🔄 Has decidido volver al menú principal. Puedes retomar la cotización en cualquier momento.");
                    delete userSessions[ctx.from];
                    return gotoFlow(menuFlow);
                }

                const userId = ctx.from;
                userSessions[userId].no_deseado = ctx.body;
                userSessions[userId].resumen += `🚫 *Lugares no deseados:* ${ctx.body}\n`;
                console.log("Lugar no deseado capturado:", ctx.body);
            } catch (error) {
                console.error("Error capturando lugar no deseado:", error);
            }
        }
    )
    .addAnswer(
        "📧 Por último, ¿podrías proporcionarnos tu correo electrónico para ponernos en contacto contigo?",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            try {
                const input = ctx.body.trim().toLowerCase();

                if (input === 'menu') {
                    await flowDynamic("🔄 Has decidido volver al menú principal. Puedes retomar la cotización en cualquier momento.");
                    delete userSessions[ctx.from];
                    return gotoFlow(menuFlow);
                }

                const userId = ctx.from;
                userSessions[userId].email = ctx.body;
                userSessions[userId].resumen += `📧 *Correo electrónico:* ${ctx.body}\n`;
                console.log("Correo electrónico capturado:", ctx.body);
            } catch (error) {
                console.error("Error capturando correo electrónico:", error);
            }
        }
    )
    .addAnswer(
        "📄 Gracias por toda la información. A continuación, te mostramos un resumen de tu cotización:",
        { capture: false },
        async (ctx, { flowDynamic }) => {
            try {
                const userId = ctx.from;
                const resumenCompleto = `*📝 Resumen de cotización:*\n${userSessions[userId].resumen}`;
                await flowDynamic(resumenCompleto);
                console.log("Resumen enviado");

                // Limpiar los datos del usuario después de finalizar el flujo
                delete userSessions[userId];
            } catch (error) {
                console.error("Error mostrando resumen:", error);
            }
        }
    )
    .addAnswer("✨ Nuestros agentes estarán contactándote en breve para finalizar la cotización. ¡Gracias por elegirnos!\n\n🔄 Si deseas volver al menú, por favor escribe *Menu*.");




// Promociones
const flowPromos = addKeyword(EVENTS.ACTION)
    .addAnswer("🌴 *Promociones en el Caribe* 🌴", {
        media: "https://www.towertravel.com.ar/web/upfiles/flyers/DESTINOS_CARIBE_TOWER_SALE_PALLADIUM_2025_INFO.jpg?t=1724944561",
    })
    .addAnswer("🌴 *Promociones en el Caribe* 🌴", {
        media: "https://www.towertravel.com.ar/web/upfiles/flyers/DESTINOS_CARIBE_TOWER_SALE_CARIBE_INFO.jpg?t=1724944561",
        delay: 500  // 0.5 segundos de retraso
    })
    .addAnswer("🌍 *Promociones en Europa* 🌍", {
        media: "https://www.towertravel.com.ar/web/upfiles/flyers/DESTINOS_EUROPA_Y_MEDIO_ORIENTE_EUROPA_CON_TOWER_SALE_INFO.jpg?t=1724944561",
        delay: 500  // 0.5 segundos de retraso
    })
    .addAnswer("🔴 *Importante:* Las promociones pueden cambiar, por lo que te recomendamos siempre verificar los detalles con uno de nuestros agentes para asegurarte de que estén actualizadas. 🛎️", {
        delay: 500  // 0.5 segundos de retraso
    })
    .addAnswer("🔄 Si deseas volver al menú, por favor escribe *Menu*.", {
        delay: 500  // 0.5 segundos de retraso
    });
    

// Menú inicial
const menuFlow = addKeyword(["Menu", "Menú", "menu", "menú"]).addAnswer(
    menu,
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!["1", "2", "3", "4", "0"].includes(ctx.body.trim())) {
            return fallBack(
                "Respuesta no válida, por favor selecciona una de las opciones."
            );
        }
        switch (ctx.body.trim()) {
            case "1":
                return gotoFlow(flowConsultas);
            case "2":
                return gotoFlow(flowPromos);
            case "3":
                try {
                    const agentesInfo = await getAgentesInfo();
                    return await flowDynamic(`${agentesInfo}`);
                } catch (error) {
                    return await flowDynamic(error);
                }
                case "4":
                return gotoFlow(flowUbicacion);
            case "0":
                return await flowDynamic(
                    "Saliendo... Puedes volver a acceder a este menú escribiendo '*Menu*'"
                );
        }
    }
);

// Iniciar el bot
const main = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([flowPrincipal, menuFlow, flowConsultas, flowPromos, flowUbicacion]);
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb();
};

main();
