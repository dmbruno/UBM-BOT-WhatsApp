// ==========================================
// ADMIN HANDLER - Funciones de administrador
// ==========================================
import db from '../database.js';
import { sendMessage } from '../utils/utils.js';

const dbQuery = async (query) => {
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

export async function handleAdminSelection(sock, from, text, conversationState) {
    const option = text.trim();
    const userId = from.split('@')[0];
    const adminNumbers = ['5493875051112', '5493875396909'];
    
    if (!adminNumbers.includes(userId)) {
        await sendMessage(sock, from, '❌ No tienes permisos para acceder a esta función.');
        delete conversationState[from];
        return;
    }

    try {
        let result;
        let message = '';

        if (option === '1') {
            console.log("📋 Consultando todos los usuarios...");
            result = await dbQuery(`SELECT id, nombre, telefono, correo FROM usuarios ORDER BY id DESC;`);
            
            if (result.length === 0) {
                message = '📭 No hay usuarios registrados.';
            } else {
                message = '👥 *Lista de Usuarios Registrados:*\n\n';
                result.forEach((row, index) => {
                    message += `${index + 1}. *${row.nombre}*\n`;
                    
                    // Mostrar correo (más confiable)
                    if (row.correo) {
                        message += `   📧 ${row.correo}\n`;
                    }
                    
                    // Mostrar teléfono con emoji apropiado
                    if (row.telefono) {
                        // Validar si es un número de teléfono real
                        // Debe empezar con códigos de país comunes (1-9) y tener entre 10-15 dígitos
                        const empiezaConCodigoPais = /^[1-9]/.test(row.telefono);
                        const longitudValida = row.telefono.length >= 10 && row.telefono.length <= 14;
                        const soloDigitos = /^\d+$/.test(row.telefono);
                        
                        // LIDs de WhatsApp suelen empezar con 2 o tener patrones extraños
                        const pareceWhatsAppLID = row.telefono.startsWith('2') && row.telefono.length >= 15;
                        
                        const esNumeroReal = soloDigitos && empiezaConCodigoPais && longitudValida && !pareceWhatsAppLID;
                        
                        if (esNumeroReal) {
                            message += `   📱 +${row.telefono}\n`;
                        } else {
                            message += `   🔑 WhatsApp LID: ${row.telefono.substring(0, 20)}...\n`;
                        }
                    }
                    
                    message += '\n';
                });
                
                message += `\n📊 *Total:* ${result.length} usuario(s) registrado(s)`;
            }
            
        } else if (option === '2') {
            console.log("📋 Consultando todas las consultas...");
            result = await dbQuery(`
                SELECT 
                    usuarios.nombre AS usuario_nombre,
                    usuarios.telefono AS usuario_telefono,
                    usuarios.correo AS usuario_correo,
                    consultas.pasajeros,
                    consultas.meses_disponibles,
                    consultas.duracion,
                    consultas.destino
                FROM consultas
                INNER JOIN usuarios ON consultas.usuario_id = usuarios.id;
            `);
            
            if (result.length === 0) {
                message = '📭 No hay consultas registradas.';
            } else {
                message = '📝 *Lista de Consultas:*\n\n';
                result.forEach((row, index) => {
                    message += `${index + 1}. *${row.usuario_nombre}*\n`;
                    message += `   📧 ${row.usuario_correo}\n`;
                    message += `   📞 ${row.usuario_telefono}\n`;
                    message += `   👥 Pasajeros: ${row.pasajeros}\n`;
                    message += `   📅 Meses: ${row.meses_disponibles}\n`;
                    message += `   ⏳ Duración: ${row.duracion} días\n`;
                    message += `   🌍 Destino: ${row.destino}\n\n`;
                });
            }
            
        } else if (option === '3') {
            console.log("📋 Consultando interacciones...");
            result = await dbQuery(`
                SELECT 
                    usuarios.nombre,
                    usuarios.telefono,
                    usuarios.correo,
                    interacciones.flujo,
                    interacciones.respuesta,
                    interacciones.fecha
                FROM interacciones
                INNER JOIN usuarios ON interacciones.usuario_id = usuarios.id
                ORDER BY interacciones.fecha DESC;
            `);
            
            if (result.length === 0) {
                message = '📭 No hay interacciones registradas.';
            } else {
                message = '💬 *Últimas 50 Interacciones:*\n\n';
                result.forEach((row, index) => {
                    // Formatear fecha a DD/MM/YYYY
                    const fecha = new Date(row.fecha);
                    const dia = String(fecha.getDate()).padStart(2, '0');
                    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                    const año = fecha.getFullYear();
                    const fechaFormateada = `${dia}/${mes}/${año}`;
                    
                    message += `${index + 1}. *${row.nombre}*\n`;
                    message += `   📧 ${row.correo}\n`;
                    message += `   📞 ${row.telefono}\n`;
                    message += `   📝 Flujo: ${row.flujo}\n`;
                    message += `   💡 Respuesta: ${row.respuesta}\n`;
                    message += `   📅 ${fechaFormateada}\n\n`;
                });
                
            }
            
        } else {
            await sendMessage(sock, from, '⚠️ Opción no válida. Por favor selecciona 1, 2 o 3.');
            return;
        }

        await sendMessage(sock, from, message);
        await sendMessage(sock, from, 'Escribe *menu* para volver al menú principal.');
        delete conversationState[from];

    } catch (error) {
        console.error('❌ Error en admin:', error);
        await sendMessage(sock, from, '⚠️ Hubo un error al procesar tu solicitud.');
        delete conversationState[from];
    }
}
