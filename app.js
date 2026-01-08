const { createBot, createProvider, createFlow } = require('@bot-whatsapp/bot');
require("dotenv").config();

const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
const db = require('./database');
const qrcode = require('qrcode-terminal');

// Flujos
const flowTest = require('./flows/test');
const flowAdmin = require('./flows/admin');
const flowInicio = require('./flows/inicio');
const flowRegistro = require('./flows/registro');
const menuFlow = require('./flows/menu');
const flowUbicacion = require('./flows/ubicacion');
const flowConsultas = require('./flows/consultas');

// FLUJOS NOVEDADES
const flowNovedades = require('./flows/novedades');
const flowFormula1 = require('./flows/formula1');
const flowMundialClubes = require('./flows/mundialClubes');

// FLUJO ENJOY 15
const flowTus15 = require('./flows/flowTus15');
const flowVip = require('./flows/enjoy15/flowVip');
const flowPremium = require('./flows/enjoy15/flowPremium');
const flowClassic = require('./flows/enjoy15/flowClassic');
const flowWeek = require('./flows/enjoy15/flowWeek');

// Flujos Europa
const europaFlow = require('./flows/Europa/europaFlow');
const flowAndalucia = require('./flows/Europa/flowAndalucia');
const flowItalia = require('./flows/Europa/flowItalia');
const flowTesoros = require('./flows/Europa/flowTesoros');
const flowInglaterra = require('./flows/Europa/flowInglaterra');
const flowAventuraIberica = require('./flows/Europa/flowAventuraIberica');
const flowCoreaJapon = require('./flows/Europa/flowCoreaJapon');
const flowDescubreItalia = require('./flows/Europa/flowDescubreItalia');
const flowTurquiaDubai = require('./flows/Europa/flowTurquiaDubai');

// Flujos Resto del Mundo
const restoDelMundoFlow = require('./flows/RestoDelMundo/restoDelMundoFlow');
const flowMexico = require('./flows/RestoDelMundo/flowMexico');
const flowUsa = require('./flows/RestoDelMundo/flowUsa');
const flowAsia = require('./flows/RestoDelMundo/flowAsia');
const espanaPortugalMarruecos = require('./flows/RestoDelMundo/flowEspanaPortugalMarruecos');
const flowTurquiaYEgeo = require('./flows/flowTurquiaYEgeo');

// Inicialización del bot
const main = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([
        flowTest,
        flowAdmin,
        flowInicio,
        flowRegistro,
        menuFlow,
        flowConsultas,
        flowUbicacion,
        flowNovedades,
        flowFormula1,
        flowMundialClubes,
        flowTurquiaYEgeo,
        flowTus15,
        flowVip,
        flowPremium,
        flowClassic,
        flowWeek,
        europaFlow,
        flowAndalucia,
        flowItalia,
        flowTesoros,
        flowInglaterra,
        flowAventuraIberica,
        flowCoreaJapon,
        flowDescubreItalia,
        flowTurquiaDubai,
        restoDelMundoFlow,
        flowMexico,
        flowUsa,
        flowAsia,
        espanaPortugalMarruecos
    ]);

    const adapterProvider = createProvider(BaileysProvider, {
        browser: ['Bot', 'Chrome', '1.0.0'],
        syncFullHistory: false,
        markOnlineOnConnect: false
    });

    // Escuchar el evento de actualización de conexión para mostrar el QR
    adapterProvider.on('connection.update', (update) => {
        const { connection, qr } = update;
        
        if (qr) {
            console.log('📱 Escanea este código QR con WhatsApp:');
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'open') {
            console.log('✅ Conexión establecida con WhatsApp');
        }
        
        if (connection === 'close') {
            console.log('❌ Conexión cerrada');
        }
    });

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb();
};

// ⚠️ HANDLERS GLOBALES DE ERRORES ⚠️
process.on('unhandledRejection', (reason, promise) => {
    console.error('[ERROR] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[ERROR] Uncaught Exception:', error);
});

main();
