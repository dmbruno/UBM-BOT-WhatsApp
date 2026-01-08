// ==========================================
// EUROPA MENU - Orquestador de paquetes Europa
// ==========================================
// Este archivo coordina los 4 destinos de Europa
import { sendMessage } from '../../utils/utils.js';
import { handleAventuraIberica, handleInteresAventuraIberica } from './aventuraIberica.js';
import { handleCoreaJapon, handleInteresCoreaJapon } from './coreaJapon.js';
import { handleDescubreItalia, handleInteresDescubreItalia } from './descubreItalia.js';
import { handleTurquiaDubai, handleInteresTurquiaDubai } from './turquiaDubai.js';

export async function handleEuropaSelection(sock, from, text, conversationState) {
    const normalizedText = text.toLowerCase().trim();
    const state = conversationState[from];
    
    // Si está esperando respuesta de interés (sí/no)
    if (state && state.step === 'EUROPA_INTERES') {
        // Determinar qué paquete está consultando basándose en el flujo guardado
        const flujo = state.data.flujo;
        
        if (flujo === 'Aventura-Iberica') {
            await handleInteresAventuraIberica(sock, from, text, conversationState);
        } else if (flujo === 'Corea-Japon') {
            await handleInteresCoreaJapon(sock, from, text, conversationState);
        } else if (flujo === 'Descubre-Italia') {
            await handleInteresDescubreItalia(sock, from, text, conversationState);
        } else if (flujo === 'Turquia-Dubai') {
            await handleInteresTurquiaDubai(sock, from, text, conversationState);
        }
        return;
    }
    
    // Selección de paquete específico
    switch (normalizedText) {
        case '1':
            await handleAventuraIberica(sock, from, conversationState);
            break;
        case '2':
            await handleCoreaJapon(sock, from, conversationState);
            break;
        case '3':
            await handleDescubreItalia(sock, from, conversationState);
            break;
        case '4':
            await handleTurquiaDubai(sock, from, conversationState);
            break;
        default:
            await sendMessage(sock, from, '⚠️ Opción no válida. Por favor selecciona 1, 2, 3 o 4.');
            break;
    }
}
