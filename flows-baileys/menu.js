// ==========================================
// MENU FLOW - Flujo de menú principal
// ==========================================
import { sendMessage } from '../utils/utils.js';
import { handleAdminSelection } from '../handlers/adminHandler.js';

export async function showMenu(sock, from, conversationState) {
    const menuText = `🌍 *Menú Principal* 🌍
🤖 *UBM VIAJES Y TURISMO*

En qué podemos ayudarte hoy❓ Elige una de las siguientes opciones:

1️⃣ *Quiero una cotización*
   Descubre los mejores destinos para tus próximas vacaciones 🌴✈️

2️⃣ *Consultar la Ubicación*
   Encuentra la ubicación de nuestra agencia 📍🏢

3️⃣ *Tus 15 con UBM*
   Celebra tus 15 años con un viaje inolvidable 💃🌎

4️⃣ *Grupales - Europa*
   Descubre las mejores rutas y experiencias en Europa 🌍✨

✍️ Escribe el *número* de la opción que te interesa, y te ayudaremos con gusto.`;

    await sendMessage(sock, from, menuText);
    
    conversationState[from] = {
        step: 'MENU',
        data: {}
    };
}

export async function handleMenuSelection(sock, from, text, conversationState) {
    const option = text.trim().toLowerCase();
    const userId = from.split('@')[0];

    // Opción especial: admin
    if (option === 'admin') {
        const adminNumbers = ['5493875051112', '5493875396909'];
        if (adminNumbers.includes(userId)) {
            await sendMessage(sock, from, `🔐 *Modo Administrador Activado*. Escribe el tipo de información que deseas consultar:

1️⃣ *Usuarios*
2️⃣ *Consultas*
3️⃣ *Interacciones*

Escribe el número correspondiente. Y si deseas volver solo escribe *menu*.`);
            conversationState[from].step = 'ADMIN';
            return;
        } else {
            await sendMessage(sock, from, '❌ No tienes permisos para acceder a esta función.');
            delete conversationState[from];
            return;
        }
    }

    switch (option) {
        case '1':
            // Iniciar flujo de cotización/consultas
            await sendMessage(sock, from, '👥 ¿Cuántos pasajeros son?\nPor favor, indica el número de adultos y si hay menores con edades (0 a 11 años).\n\n💡 _Escribe *menu* en cualquier momento para volver al inicio._');
            conversationState[from].step = 'CONSULTA_PASAJEROS';
            conversationState[from].data = { resumen: '' };
            break;

        case '2':
            // Mostrar ubicación
            const ubicacionText = `📍 *Ubicación - UBM Viajes y Turismo:*
📌 Dean Funes 345, Ciudad de Salta, Argentina

🌍 Ver en el Mapa https://bit.ly/3BfW49P

🕐 *Horario de atención:*
De lunes a viernes de 10:00 a 17:00 🕑

¡🔄 Si deseas volver al menú, por favor escribe *Menu*.!`;
            await sendMessage(sock, from, ubicacionText);
            delete conversationState[from];
            break;

        case '3':
            // Tus 15 con UBM
            await sendMessage(sock, from, `🎉 *Tus 15 con UBM* 🎉
💃 ✨ 🌎

¡Celebrá tus 15 años con la experiencia de tu vida! 🎂✈️

Tenemos paquetes especiales diseñados para vos:

1️⃣ *Paquete VIP* 💎
   📅 20 días y 17 noches
   ✨ La experiencia más completa

2️⃣ *Paquete Premium* ⭐
   📅 17 días y 14 noches
   🎁 Todo incluido premium

3️⃣ *Paquete Classic* 🏖️
   📅 14 días y 11 noches
   🌴 La opción ideal

4️⃣ *Paquete Week* 🕶️
   📅 10 días y 7 noches
   ⚡ Aventura express

✍️ *Escribe el número* de la opción que te interesa para recibir más información.

💡 _Escribe *menu* en cualquier momento para volver al inicio._`);
            conversationState[from].step = 'TUS15';
            break;

        case '4':
            // Grupales Europa - Mostrar directamente el menú de opciones
            await sendMessage(sock, from, `🌍 *Salidas Grupales - Europa* 🌟

¡Descubrí los destinos más fascinantes con nuestras opciones exclusivas! Elegí la opción que más te interese:

1️⃣ *Aventura Ibérica* 🇪🇸🇵🇹
   Madrid, Andalucía, Portugal y muchos más...

2️⃣ *Corea y Japón* 🇰🇷🇯🇵
   Seúl, Tokio, Kioto y muchos más...

3️⃣ *Descubre Italia* 🇮🇹
   Milán, Venecia, Roma y muchos más...

4️⃣ *Turquía y Dubái* 🇹🇷🇦🇪
   Estambul, Capadocia, Dubái y muchos más...

✍️ *Escribe el número de la opción que te interesa* para recibir más información.`);
            conversationState[from].step = 'EUROPA';
            break;

        case '0':
            await sendMessage(sock, from, "🔄 Saliendo... Puedes volver a este menú escribiendo '*menu*'");
            delete conversationState[from];
            break;

        default:
            await sendMessage(sock, from, '⚠️ Respuesta no válida. Por favor selecciona una de las opciones (1-4).');
            await showMenu(sock, from, conversationState);
            break;
    }
}
