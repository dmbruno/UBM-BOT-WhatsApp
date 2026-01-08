// ==========================================
// COREA Y JAPÓN - Paquete Europa
// ==========================================
import { getUserByPhone, sendMessage } from '../../utils/utils.js';
import db from '../../database.js';

export const PAQUETE_COREA_JAPON = {
    nombre: 'Corea y Japón',
    flujo: 'Corea-Japon',
    imagen: 'https://drive.google.com/uc?export=view&id=16Iw5Yh3ZUKfhd-HbblMseS_wEqzsXc2C',
    descripcion: `📅 *Salida:* 27 de febrero - 13 noches
✈️ *Desde:* Buenos Aires

📍 *Recorrido:*
Seúl - Jeonju - Busan - Shimonoseki - Hiroshima - Matsuyama - Kobe - Osaka - Monte Koya - Kioto - Tokio

✨ *Incluye:*
✈️ Aéreo + Traslados + Alojamiento con desayuno. 🛏️
🏙️ Visitas según itinerario. 🏯
🧳 1 equipaje en bodega de 23 kg + 1 equipaje de mano de 10kg.
👨‍✈️ Guías locales de habla hispana durante todo el recorrido.
🎒 Kit de viaje: mochila + botella + cubrevalijas.
🩺 Asistencia al viajero Infinit.

💰 *Precio:*
Desde USD 6576 + IMP 1150 por persona en base doble

📝 *La grupal saldrá acompañada desde Argentina con un mínimo de 20 pasajeros.*`
};

export async function handleCoreaJapon(sock, from, conversationState) {
    const userId = from.split('@')[0];
    
    try {
        // Enviar imagen
        await sock.sendMessage(from, {
            image: { url: PAQUETE_COREA_JAPON.imagen },
            caption: `🌍 *${PAQUETE_COREA_JAPON.nombre}* ✨`
        });
        
        // Enviar descripción completa
        await sendMessage(sock, from, PAQUETE_COREA_JAPON.descripcion);
        
        // Preguntar si quiere más información
        await sendMessage(sock, from, `🤔 ¿Te gustaría recibir más información sobre *${PAQUETE_COREA_JAPON.nombre}*? Escribe *sí* o *no*:`);
        
        // Actualizar estado
        conversationState[from] = {
            step: 'EUROPA_INTERES',
            data: { 
                nombre: PAQUETE_COREA_JAPON.nombre,
                flujo: PAQUETE_COREA_JAPON.flujo
            }
        };
        
    } catch (error) {
        console.error('❌ Error enviando información de Corea y Japón:', error);
        await sendMessage(sock, from, '⚠️ Hubo un error al enviar la información. Por favor, intenta nuevamente.');
        delete conversationState[from];
    }
}

export async function handleInteresCoreaJapon(sock, from, respuesta, conversationState) {
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
                    [user.id, PAQUETE_COREA_JAPON.flujo, 'Interesado', new Date().toISOString()],
                    (err) => {
                        if (err) {
                            console.error("❌ Error al guardar interacción:", err.message);
                            return reject(err);
                        }
                        console.log(`✅ Interacción registrada: ${PAQUETE_COREA_JAPON.flujo}`);
                        resolve();
                    }
                );
            });

            const correo = user.correo || "no registrado";
            await sendMessage(sock, from, `✅ ¡Excelente! Hemos registrado tu interés en *${PAQUETE_COREA_JAPON.nombre}* 🌟.

📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.

😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`);
            
            await sendMessage(sock, from, '✨ Si necesitas algo más, escribe *menu* para volver al inicio.');
            delete conversationState[from];
            
        } catch (error) {
            console.error('❌ Error guardando interés en Corea y Japón:', error);
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
