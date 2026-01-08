// ==========================================
// DESCUBRE ITALIA - Paquete Europa
// ==========================================
import { getUserByPhone, sendMessage } from '../../utils/utils.js';
import db from '../../database.js';

export const PAQUETE_DESCUBRE_ITALIA = {
    nombre: 'Descubre Italia',
    flujo: 'Descubre-Italia',
    imagen: 'https://drive.google.com/uc?export=view&id=1iuGavfptvEEivL9MMNOO3_3Rg62FO35L',
    descripcion: `📅 *Salida:* 22 de mayo - 14 noches
✈️ *Desde:* Buenos Aires

📍 *Recorrido:*
Milán - Sirmione - Verona - Venecia - Murano - Burano - Florencia - Cinque Terre - Pisa - Siena - San Gimignano - Chianti - Asís - Roma - Pompeya - Sorrento - Capri - Salerno - Costa Amalfitana - Pertosa Grutas - Paestum - Nápoles

✨ *Incluye:*
✈️ Aéreo Buenos Aires / Milán // Nápoles / Buenos Aires. 🛏️
🧳 1 equipaje en bodega + 1 equipaje de mano.
🚐 Traslados de llegada y salida del aeropuerto principal.
🏨 Alojamiento en hoteles céntricos con desayuno + 12 comidas
🎫 Excursiones y Entradas según itinerario.
👨‍✈️ Guía acompañante de habla hispana.
🎒 Kit de viaje: mochila + botella + cubrevalijas.
🩺 Asistencia al viajero Infinit.

💰 *Precio:*
Desde USD 6240 + IMP 986 por persona en base doble

📝 *La grupal saldrá acompañada desde Argentina con un mínimo de 20 pasajeros.*`
};

export async function handleDescubreItalia(sock, from, conversationState) {
    const userId = from.split('@')[0];
    
    try {
        // Enviar imagen
        await sock.sendMessage(from, {
            image: { url: PAQUETE_DESCUBRE_ITALIA.imagen },
            caption: `🌍 *${PAQUETE_DESCUBRE_ITALIA.nombre}* ✨`
        });
        
        // Enviar descripción completa
        await sendMessage(sock, from, PAQUETE_DESCUBRE_ITALIA.descripcion);
        
        // Preguntar si quiere más información
        await sendMessage(sock, from, `🤔 ¿Te gustaría recibir más información sobre *${PAQUETE_DESCUBRE_ITALIA.nombre}*? Escribe *sí* o *no*:`);
        
        // Actualizar estado
        conversationState[from] = {
            step: 'EUROPA_INTERES',
            data: { 
                nombre: PAQUETE_DESCUBRE_ITALIA.nombre,
                flujo: PAQUETE_DESCUBRE_ITALIA.flujo
            }
        };
        
    } catch (error) {
        console.error('❌ Error enviando información de Descubre Italia:', error);
        await sendMessage(sock, from, '⚠️ Hubo un error al enviar la información. Por favor, intenta nuevamente.');
        delete conversationState[from];
    }
}

export async function handleInteresDescubreItalia(sock, from, respuesta, conversationState) {
    const userId = from.split('@')[0];
    const normalizedText = respuesta.toLowerCase().trim();
    
    if (normalizedText === 'sí' || normalizedText === 'si') {
        try {
            const user = await getUserByPhone(userId);
            
            if (!user) {
                await sendMessage(sock, from, '⚠️ No encontramos tu registro. Por favor, escribe *menu* para volver al menú principal.');
                delete conversationState[from];
                return;
            }

            // Guardar interacción en la base de datos
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO interacciones (usuario_id, flujo, respuesta, fecha) VALUES (?, ?, ?, ?)`,
                    [user.id, PAQUETE_DESCUBRE_ITALIA.flujo, 'Interesado', new Date().toISOString()],
                    (err) => {
                        if (err) {
                            console.error("❌ Error al guardar interacción:", err.message);
                            return reject(err);
                        }
                        console.log(`✅ Interacción registrada: ${PAQUETE_DESCUBRE_ITALIA.flujo}`);
                        resolve();
                    }
                );
            });

            const correo = user.correo || "no registrado";
            await sendMessage(sock, from, `✅ ¡Excelente! Hemos registrado tu interés en *${PAQUETE_DESCUBRE_ITALIA.nombre}* 🌟.

📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.

😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`);
            
            await sendMessage(sock, from, '✨ Si necesitas algo más, escribe *menu* para volver al inicio.');
            delete conversationState[from];
            
        } catch (error) {
            console.error('❌ Error guardando interés en Descubre Italia:', error);
            await sendMessage(sock, from, '⚠️ Ocurrió un error al procesar tu respuesta. Por favor, inténtalo nuevamente.');
            delete conversationState[from];
        }
    } else if (normalizedText === 'no') {
        await sendMessage(sock, from, '😊 Gracias por tu tiempo. Escribe *menu* para volver al menú principal.');
        delete conversationState[from];
    } else {
        await sendMessage(sock, from, '⚠️ Respuesta no válida. Por favor, escribe *sí* o *no*.');
    }
}
