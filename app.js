import makeWASocket, { 
    DisconnectReason, 
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import db from './database.js';
import { handleMessage } from './handlers/messageHandler.js';

console.log('🚀 Iniciando UBM Viajes Bot con Baileys 7.x (Arquitectura Modular)...\n');

// Función principal para iniciar el bot
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    console.log(`📱 Usando WhatsApp Web v${version.join('.')}, ${isLatest ? 'última versión' : 'versión antigua'}`);

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        browser: ['UBM Viajes Bot', 'Chrome', '120.0.0'],
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
    });

    // Manejar actualización de credenciales
    sock.ev.on('creds.update', saveCreds);

    // Manejar conexión/desconexión
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n📱 Escanea este código QR con WhatsApp:\n');
            qrcode.generate(qr, { small: true });
            console.log('\n⏳ Esperando escaneo...\n');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                : true;

            console.log('❌ Conexión cerrada. Reconectando:', shouldReconnect);

            if (shouldReconnect) {
                console.log('🔄 Reconectando en 5 segundos...');
                setTimeout(() => startBot(), 5000);
            } else {
                console.log('🚪 Sesión cerrada. Elimina auth_info_baileys/ y reinicia.');
                process.exit(0);
            }
        } else if (connection === 'open') {
            console.log('✅ Bot conectado exitosamente!');
            console.log('📞 Número:', sock.user?.id);
            console.log('👤 Nombre:', sock.user?.name);
            console.log('\n🤖 Bot listo para recibir mensajes...\n');
        } else if (connection === 'connecting') {
            console.log('🔌 Conectando a WhatsApp...');
        }
    });

    // Manejar mensajes entrantes
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const message of messages) {
            // Ignorar mensajes propios
            if (message.key.fromMe) continue;

            // Ignorar mensajes de grupos por ahora (opcional)
            // if (message.key.remoteJid.endsWith('@g.us')) continue;

            try {
                await handleMessage(sock, message);
            } catch (error) {
                console.error('❌ Error procesando mensaje:', error);
            }
        }
    });

    // Manejar actualizaciones de presencia (opcional)
    sock.ev.on('presence.update', ({ id, presences }) => {
        // console.log(`👁️ Presencia actualizada: ${id}`, presences);
    });

    // Manejar grupos (opcional)
    sock.ev.on('groups.update', (updates) => {
        // console.log('📦 Grupos actualizados:', updates);
    });

    // Manejar contactos (opcional)
    sock.ev.on('contacts.update', (updates) => {
        // console.log('👥 Contactos actualizados:', updates.length);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n\n🛑 Cerrando bot...');
        await sock?.end();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\n\n🛑 Cerrando bot...');
        await sock?.end();
        process.exit(0);
    });

    return sock;
}

// Iniciar el bot
startBot().catch(err => {
    console.error('💥 Error fatal al iniciar el bot:', err);
    process.exit(1);
});