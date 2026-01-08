// ==========================================
// UBM VIAJES BOT - BAILEYS 7.X MODULAR
// ==========================================
// Arquitectura modular para fácil mantenimiento
// Cada flujo está en su propio archivo

import makeWASocket, { 
    DisconnectReason, 
    useMultiFileAuthState,
    Browsers
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { handleMessage } from './handlers/messageHandler.js';

// ==========================================
// CONFIGURACIÓN
// ==========================================
const AUTH_PATH = './bot_sessions';
const logger = pino({ level: 'silent' });

// Estado global de conversaciones
export const conversationState = {};

// ==========================================
// FUNCIÓN PRINCIPAL DE CONEXIÓN
// ==========================================
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger,
        browser: Browsers.ubuntu('Chrome'),
        generateHighQualityLinkPreview: true
    });

    // ==========================================
    // EVENT: Actualización de conexión
    // ==========================================
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n📱 ===== ESCANEA ESTE QR CON WHATSAPP =====\n');
            qrcode.generate(qr, { small: true });
            console.log('\n==========================================\n');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                : true;

            console.log('❌ Conexión cerrada. Reconectando:', shouldReconnect);

            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('✅ BOT CONECTADO CON BAILEYS 7.X - ARQUITECTURA MODULAR');
            console.log('🌍 UBM Viajes - Sistema activo');
            console.log('📱 Soporte completo para LIDs y PNs');
            console.log('📁 Estructura modular para fácil mantenimiento');
            console.log('👂 Escuchando mensajes...\n');
        }
    });

    // Guardar credenciales cuando cambien
    sock.ev.on('creds.update', saveCreds);

    // ==========================================
    // EVENT: Nuevos mapeos LID <-> PN
    // ==========================================
    sock.ev.on('lid-mapping.update', (mapping) => {
        console.log('🔄 Nuevo mapeo LID detectado:', mapping);
    });

    // ==========================================
    // EVENT: Mensajes entrantes
    // ==========================================
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const message of messages) {
            // Ignorar mensajes propios y de grupos
            if (message.key.fromMe || message.key.remoteJid.endsWith('@g.us')) continue;

            // Delegar al handler de mensajes
            await handleMessage(sock, message, conversationState);
        }
    });

    return sock;
}

// ==========================================
// INICIAR BOT
// ==========================================
console.log('🚀 Iniciando UBM Viajes Bot con Baileys 7.x (Arquitectura Modular)...\n');
connectToWhatsApp();

// Manejar errores globales
process.on('unhandledRejection', (reason) => {
    console.error('[ERROR] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[ERROR] Uncaught Exception:', error);
});
