const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot');
require("dotenv").config();

const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
const { delay } = require('@whiskeysockets/baileys');
const db = require('./database');
const path = require('path');
const fs = require('fs');



// Configuración de rutas y carpetas
const express = require('express');

const app = express();

const PORT = 3001; // Cambia el puerto si es necesario
const archivosPath = path.join(__dirname, 'public', 'archivos');
app.use('/archivos', express.static(archivosPath));

// Hacer que la carpeta "archivos" sea accesible
app.get('/download/:file', (req, res) => {
    const fileName = req.params.file;
    const filePath = path.join(archivosPath, fileName);

    if (fs.existsSync(filePath)) {
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('❌ Error al descargar el archivo:', err.message);
                res.status(500).send('Error al descargar el archivo');
            }
        });
    } else {
        res.status(404).send('Archivo no encontrado');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});





// Flujos
const flowAdmin = require('./flows/admin');
const flowInicio = require('./flows/inicio');
const menuFlow = require('./flows/menu');
const flowUbicacion = require('./flows/ubicacion');
const flowConsultas = require('./flows/consultas');
const flowNovedades = require('./flows/novedades');
const flowFormula1 = require('./flows/formula1');
const flowMundialClubes = require('./flows/mundialClubes');
const flowPeru = require('./flows/flowPeru');
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

// Flujos Resto del Mundo
const restoDelMundoFlow = require('./flows/RestoDelMundo/restoDelMundoFlow');
const flowMexico = require('./flows/RestoDelMundo/flowMexico');
const flowUsa = require('./flows/RestoDelMundo/flowUsa');
const flowAsia = require('./flows/RestoDelMundo/flowAsia');
const espanaPortugalMarruecos = require('./flows/RestoDelMundo/flowEspanaPortugalMarruecos');





// Inicialización del bot
const main = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([
        flowAdmin,
        flowInicio,
        menuFlow,
        flowConsultas,
        flowUbicacion,
        flowNovedades,
        flowFormula1,
        flowMundialClubes,
        flowPeru,
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
        restoDelMundoFlow,
        flowMexico,
        flowUsa,
        flowAsia,
        espanaPortugalMarruecos
    ]);

    const adapterProvider = createProvider(BaileysProvider);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb();
};

main();