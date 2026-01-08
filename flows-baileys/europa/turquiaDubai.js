// ==========================================
// TURQUÍA Y DUBÁI - Paquete Europa
// ==========================================
import { getUserByPhone, sendMessage } from '../../utils/utils.js';
import db from '../../database.js';

export const PAQUETE_TURQUIA_DUBAI = {
    nombre: 'Turquía y Dubái',
    flujo: 'Turquia-Dubai',
    imagen: 'https://drive.google.com/uc?export=view&id=1SJlIY6V0RYj7DGbzAQ1cWCedQk4EEDt3',
    descripcion: `📅 *Salida:* 01 de febrero - 14 noches
✈️ *Desde:* Buenos Aires

📍 *Recorrido:*
Estambul - Ankara - Capadocia - Pamukkale - Éfeso - Ízmir/Kusadasi - Pérgamo - Troya - Canakkale - Bursa - Estambul - Dubái

✨ *Incluye:*
✈️ Aéreos + alojamiento con Desayuno + traslados
🏙️ Visitas según itinerario con guía de habla hispana
🧳 Incluye equipaje 23kg
🩺 Asistencia al viajero infinit
🎒 Kit de viaje: mochila + botella + cubrevalijas.

💰 *Precio:*
Desde USD 3573 + IMP 900 por persona en base doble

📝 *La grupal saldrá acompañada desde Argentina con un mínimo de 20 pasajeros.*`
};

export async function handleTurquiaDubai(sock, from, conversationState) {
    const userId = from.split('@')[0];
    
    try {
        // Enviar imagen
        await sock.sendMessage(from, {
            image: { url: PAQUETE_TURQUIA_DUBAI.imagen },
            caption: `🌍 *${PAQUETE_TURQUIA_DUBAI.nombre}* ✨`
        });
        
        // Enviar descripción completa
        await sendMessage(sock, from, PAQUETE_TURQUIA_DUBAI.descripcion);
        
        // Preguntar si quiere más información
        await sendMessage(sock, from, `🤔 ¿Te gustaría recibir más información sobre *${PAQUETE_TURQUIA_DUBAI.nombre}*? Escribe *sí* o *no*:`);
        
        // Actualizar estado
        conversationState[from] = {
            step: 'EUROPA_INTERES',
            data: { 
                nombre: PAQUETE_TURQUIA_DUBAI.nombre,
                flujo: PAQUETE_TURQUIA_DUBAI.flujo
            }
        };
        
    } catch (error) {
        console.error('❌ Error enviando información de Turquía y Dubái:', error);
        await sendMessage(sock, from, '⚠️ Hubo un error al enviar la información. Por favor, intenta nuevamente.');
        delete conversationState[from];
    }
}

export async function handleInteresTurquiaDubai(sock, from, respuesta, conversationState) {
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
                    [user.id, PAQUETE_TURQUIA_DUBAI.flujo, 'Interesado', new Date().toISOString()],
                    (err) => {
                        if (err) {
                            console.error("❌ Error al guardar interacción:", err.message);
                            return reject(err);
                        }
                        console.log(`✅ Interacción registrada: ${PAQUETE_TURQUIA_DUBAI.flujo}`);
                        resolve();
                    }
                );
            });

            const correo = user.correo || "no registrado";
            await sendMessage(sock, from, `✅ ¡Excelente! Hemos registrado tu interés en *${PAQUETE_TURQUIA_DUBAI.nombre}* 🌟.

📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.

😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`);
            
            await sendMessage(sock, from, '✨ Si necesitas algo más, escribe *menu* para volver al inicio.');
            delete conversationState[from];
            
        } catch (error) {
            console.error('❌ Error guardando interés en Turquía y Dubái:', error);
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
