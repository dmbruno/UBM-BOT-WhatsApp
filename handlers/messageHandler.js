// ==========================================
// MESSAGE HANDLER - Manejo principal de mensajes
// ==========================================
import { getUserByPhone } from '../utils/utils.js';
import { handleConversationState } from './conversationHandler.js';
import { showMenu } from '../flows-baileys/menu.js';
import { sendMessage } from '../utils/utils.js';

export async function handleMessage(sock, message, conversationState) {
    try {
        const from = message.key.remoteJid;
        const text = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text || '';
        
        // Ignorar mensajes vacíos o notificaciones
        if (!text || text.trim().length === 0) return;
        
        const normalizedText = text.toLowerCase().trim();

        // Extraer ID del usuario (puede ser LID o PN)
        const userId = from.split('@')[0];
        const idType = from.includes('@lid') ? 'LID' : 'PN';
        
        console.log(`📩 Mensaje de ${userId} (${idType}): "${text}"`);

        // Verificar si hay un estado de conversación activo
        if (conversationState[from]) {
            await handleConversationState(sock, from, text, conversationState);
            return;
        }

        // ==========================================
        // FLUJO PRINCIPAL: Palabras clave
        // ==========================================
        const keywords = ['hola', 'hello', 'buenas', 'menu', 'inicio'];
        
        if (keywords.includes(normalizedText)) {
            const user = await getUserByPhone(userId);

            if (user) {
                // Usuario registrado
                const primerNombre = user.nombre.split(' ')[0];
                await sendMessage(sock, from, `Hola *${primerNombre}*! ¿En qué podemos ayudarte hoy?`);
                await showMenu(sock, from, conversationState);
            } else {
                // Usuario nuevo - iniciar registro
                await sendMessage(sock, from, '👋 ¡Bienvenido a *UBM Viajes*!');
                await sendMessage(sock, from, 'Antes de continuar, necesitamos algunos datos.\nPor favor, escribe tu *nombre completo*:');
                
                conversationState[from] = {
                    step: 'ESPERANDO_NOMBRE',
                    data: {}
                };
            }
            return;
        }

        // Si el mensaje no matchea ningún keyword
        await sendMessage(sock, from, '⚠️ No entendí tu mensaje. Escribe *hola* para ver el menú.');

    } catch (error) {
        console.error('❌ Error manejando mensaje:', error);
    }
}
