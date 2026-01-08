// ==========================================
// PAQUETE CLASSIC - Tus 15 con UBM
// ==========================================
import { getUserByPhone, sendMessage } from '../../utils/utils.js';
import db from '../../database.js';

export const PAQUETE_CLASSIC = {
    nombre: 'Paquete Classic',
    emoji: '✨',
    imagen: 'https://drive.google.com/uc?export=view&id=1xJtlGdHTL6QRuxcbFYa0RDfhzSV1Rkd2',
    descripcion: `📝 *¿Qué incluye el Paquete Classic?*

✅ Vuelos y traslados ✈️🚌
✅ Alojamiento dentro de Disney 🏰
✅ La mejor asistencia médica 🩺
✅ Coordinación permanente 🤝
✅ Pensión completa con bebidas 🍔🥤

🎁 *¡Una experiencia única que no olvidarás!* 🌟`
};

export async function handleClassic(sock, from, conversationState) {
    const userId = from.split('@')[0];
    
    try {
        // Enviar imagen del paquete
        await sock.sendMessage(from, {
            image: { url: PAQUETE_CLASSIC.imagen },
            caption: `${PAQUETE_CLASSIC.emoji} *${PAQUETE_CLASSIC.nombre}* 🌟`
        });
        
        // Enviar descripción
        await sendMessage(sock, from, PAQUETE_CLASSIC.descripcion);
        
        // Preguntar si quiere más información
        await sendMessage(sock, from, `🤔 ¿Te gustaría recibir más información sobre el *${PAQUETE_CLASSIC.nombre}*? Escribe *sí* o *no*:`);
        
        // Actualizar estado
        conversationState[from] = {
            step: 'TUS15_INTERES',
            data: { paquete: PAQUETE_CLASSIC.nombre }
        };
        
    } catch (error) {
        console.error('❌ Error enviando información del Paquete Classic:', error);
        await sendMessage(sock, from, '⚠️ Hubo un error al enviar la información. Por favor, intenta nuevamente.');
        delete conversationState[from];
    }
}

export async function handleInteresClassic(sock, from, respuesta, conversationState) {
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
                    [user.id, PAQUETE_CLASSIC.nombre, 'Interesado', new Date().toISOString()],
                    (err) => {
                        if (err) {
                            console.error("❌ Error al guardar interacción:", err.message);
                            return reject(err);
                        }
                        console.log(`✅ Interacción registrada: ${PAQUETE_CLASSIC.nombre}`);
                        resolve();
                    }
                );
            });

            const correo = user.correo || "no registrado";
            await sendMessage(sock, from, `✅ ¡Excelente! Hemos registrado tu interés en *${PAQUETE_CLASSIC.nombre}* 🌟.

📬 Te contactaremos pronto al correo: *${correo}* para enviarte más información.

😊 Si tienes más preguntas, no dudes en escribirnos. ¡Gracias por elegirnos!`);
            
            await sendMessage(sock, from, '✨ Si necesitas algo más, escribe *menu* para volver al inicio.');
            delete conversationState[from];
            
        } catch (error) {
            console.error('❌ Error guardando interés en Paquete Classic:', error);
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
