// ==========================================
// TUS 15 MENU - Orquestador de paquetes Tus 15
// ==========================================
// Este archivo coordina los 4 paquetes de Tus 15
import { sendMessage } from '../../utils/utils.js';
import { handleVip, handleInteresVip } from './vip.js';
import { handlePremium, handleInteresPremium } from './premium.js';
import { handleClassic, handleInteresClassic } from './classic.js';
import { handleWeek, handleInteresWeek } from './week.js';

export async function handleTus15Selection(sock, from, text, conversationState) {
    const option = text.trim().toLowerCase();
    const state = conversationState[from];
    
    // Si está esperando respuesta de interés (sí/no)
    if (state && state.step === 'TUS15_INTERES') {
        // Determinar qué paquete está consultando basándose en el nombre guardado
        const paquete = state.data.paquete;
        
        if (paquete === 'Paquete VIP') {
            await handleInteresVip(sock, from, text, conversationState);
        } else if (paquete === 'Paquete Premium') {
            await handleInteresPremium(sock, from, text, conversationState);
        } else if (paquete === 'Paquete Classic') {
            await handleInteresClassic(sock, from, text, conversationState);
        } else if (paquete === 'Paquete Week') {
            await handleInteresWeek(sock, from, text, conversationState);
        }
        return;
    }
    
    // Selección de paquete
    switch (option) {
        case '1':
            await handleVip(sock, from, conversationState);
            break;
        case '2':
            await handlePremium(sock, from, conversationState);
            break;
        case '3':
            await handleClassic(sock, from, conversationState);
            break;
        case '4':
            await handleWeek(sock, from, conversationState);
            break;
        default:
            await sendMessage(sock, from, '⚠️ Opción no válida. Por favor selecciona 1, 2, 3 o 4.');
            break;
    }
}
