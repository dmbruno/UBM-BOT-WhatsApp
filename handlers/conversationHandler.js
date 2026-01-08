// ==========================================
// CONVERSATION HANDLER - Manejo de estados de conversación
// ==========================================
import { getUserByPhone, saveUser, saveConsulta, sendMessage } from '../utils/utils.js';
import { showMenu } from '../flows-baileys/menu.js';
import { handleMenuSelection } from '../flows-baileys/menu.js';
import { handleAdminSelection } from './adminHandler.js';
import { handleTus15Selection } from '../flows-baileys/tus15/tus15Menu.js';
import { handleEuropaSelection } from '../flows-baileys/europa/europaMenu.js';

export async function handleConversationState(sock, from, text, conversationState) {
    const state = conversationState[from];
    const userId = from.split('@')[0];
    const normalizedText = text.toLowerCase().trim();

    // Permitir salir al menú en cualquier momento
    if (normalizedText === 'menu' || normalizedText === 'menú') {
        await sendMessage(sock, from, '🔄 Entendido, volvamos al menú principal...');
        delete conversationState[from];
        await showMenu(sock, from, conversationState);
        return;
    }

    switch (state.step) {
        case 'ESPERANDO_NOMBRE':
            const nombre = text.trim();
            
            if (nombre.length < 2) {
                await sendMessage(sock, from, '⚠️ Ingresa un nombre válido:');
                return;
            }

            state.data.nombre = nombre;
            state.step = 'ESPERANDO_CORREO';
            
            await sendMessage(sock, from, 'Perfecto! Ahora tu *correo electrónico*:');
            break;

        case 'ESPERANDO_CORREO':
            const correo = text.trim();
            
            if (!correo.includes('@')) {
                await sendMessage(sock, from, '⚠️ Ingresa un correo válido:');
                return;
            }

            // Guardar en base de datos
            try {
                await saveUser(userId, state.data.nombre, correo);
                
                const primerNombre = state.data.nombre.split(' ')[0];
                await sendMessage(sock, from, `✅ ¡Gracias *${primerNombre}*! Te has registrado exitosamente.`);
                
                // Limpiar estado
                delete conversationState[from];
                
                // Mostrar menú
                await showMenu(sock, from, conversationState);
                
            } catch (error) {
                console.error('Error guardando usuario:', error);
                await sendMessage(sock, from, '⚠️ Hubo un error al registrar tus datos. Intenta nuevamente escribiendo *hola*.');
                delete conversationState[from];
            }
            break;

        case 'MENU':
            await handleMenuSelection(sock, from, text, conversationState);
            break;

        case 'CONSULTA_PASAJEROS':
            state.data.pasajeros = text.trim();
            state.data.resumen += `👥 *Pasajeros:* ${text.trim()}\n`;
            state.step = 'CONSULTA_MESES';
            await sendMessage(sock, from, '📅 Perfecto, ¿en qué mes o meses estarías disponible para viajar? (Ejemplo: Enero, Febrero, etc.)\n\n💡 _Escribe *menu* en cualquier momento para volver al inicio._');
            break;

        case 'CONSULTA_MESES':
            state.data.meses_disponibles = text.trim();
            state.data.resumen += `📅 *Meses disponibles:* ${text.trim()}\n`;
            state.step = 'CONSULTA_DURACION';
            await sendMessage(sock, from, '⏳ ¿Cuántos días te gustaría viajar aproximadamente?\n\n💡 _Escribe *menu* en cualquier momento para volver al inicio._');
            break;

        case 'CONSULTA_DURACION':
            state.data.duracion = text.trim();
            state.data.resumen += `⏳ *Duración:* ${text.trim()} días\n`;
            state.step = 'CONSULTA_DESTINO';
            await sendMessage(sock, from, '🌍 ¿Cuál es tu destino preferido? ¿Tienes una segunda opción?\n\n💡 _Escribe *menu* en cualquier momento para volver al inicio._');
            break;

        case 'CONSULTA_DESTINO':
            state.data.destino = text.trim();
            state.data.resumen += `🌍 *Destino preferido:* ${text.trim()}\n`;
            
            try {
                const user = await getUserByPhone(userId);
                
                if (!user) {
                    await sendMessage(sock, from, '⚠️ No encontramos tu registro. Por favor, escribe *menu* para volver al menú principal.');
                    delete conversationState[from];
                    return;
                }

                const primerNombre = user.nombre.split(' ')[0];
                const resumenCompleto = `📄 Gracias por toda la información, *${primerNombre}*.

📝 Resumen de tu consulta:
${state.data.resumen}

✨ Nuestros agentes se comunicarán contigo pronto a tu correo: *${user.correo}*. ¡Gracias por elegirnos!`;

                await sendMessage(sock, from, resumenCompleto);
                await sendMessage(sock, from, '✨ Si necesitas algo más, escribe *menu* para volver al inicio.');

                await saveConsulta(user.id, state.data.pasajeros, state.data.meses_disponibles, state.data.duracion, state.data.destino);
                
                console.log('✅ Consulta guardada correctamente');
                delete conversationState[from];
                
            } catch (error) {
                console.error('❌ Error guardando consulta:', error);
                await sendMessage(sock, from, '⚠️ Ocurrió un problema guardando tu consulta. Por favor, inténtalo más tarde.');
                delete conversationState[from];
            }
            break;

        case 'ADMIN':
            await handleAdminSelection(sock, from, text, conversationState);
            break;

        case 'TUS15':
        case 'TUS15_INTERES':
            await handleTus15Selection(sock, from, text, conversationState);
            break;

        case 'EUROPA':
        case 'EUROPA_INTERES':
            await handleEuropaSelection(sock, from, text, conversationState);
            break;

        default:
            delete conversationState[from];
            break;
    }
}
