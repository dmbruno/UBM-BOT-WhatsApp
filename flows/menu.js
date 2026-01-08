const { addKeyword } = require('@bot-whatsapp/bot');
const flowConsultas = require('./consultas'); // Flujo de consultas
const flowUbicacion = require('./ubicacion'); // Flujo de ubicación
const flowAdmin = require('./admin'); // Flujo de administrador
const flowTus15 = require('./flowTus15'); // Flujo para "Tus 15 con UBM"
// const flowTurquiaYEgeo = require('./flowTurquiaYEgeo'); // Flujo para Machu Picchu
const europaFlow = require('./Europa/europaFlow'); // Flujo para "UBM Ola EUROPA"
// const restoMundoFlow = require('./RestoDelMundo/restoDelMundoFlow'); // Flujo para "Grupales - Resto del Mundo"

const menuFlow = addKeyword(["Menu", "Menú", "menu", "menú"]).addAnswer(
    "🌍 *Menú Principal* 🌍  \n" +
    "🤖 *UBM VIAJES Y TURISMO*\n\n" +
    "En qué podemos ayudarte hoy❓ Elige una de las siguientes opciones:\n\n" +
    "1️⃣ *Quiero una cotización*  \n" +
    "   Descubre los mejores destinos para tus próximas vacaciones 🌴✈️  \n\n" +
    "2️⃣ *Consultar la Ubicación*  \n" +
    "   Encuentra la ubicación de nuestra agencia 📍🏢  \n\n" +
    "3️⃣ *Tus 15 con UBM*  \n" +
    "   Celebra tus 15 años con un viaje inolvidable 💃🌎  \n\n" +
    "4️⃣ *Grupales - Europa*  \n" +
    "   Descubre las mejores rutas y experiencias en Europa 🌍✨\n\n" +
    "✍️ Escribe el *número* de la opción que te interesa, y te ayudaremos con gusto.",
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        console.log('📋 [menu] Opción recibida:', ctx.body);
        
        try {
            const input = ctx.body.trim().toLowerCase();

            // Validar si el input es 'admin'
            if (input === "admin") {
                console.log('🔐 [menu] Admin acceso');
                return gotoFlow(flowAdmin);
            }

            // Validar si la entrada es una opción válida
            if (!["1", "2", "3", "4", "0"].includes(ctx.body.trim())) {
                console.log('⚠️ [menu] Opción inválida');
                return fallBack("⚠️ Respuesta no válida. Por favor selecciona una de las opciones.");
            }

            // Redirigir al flujo correspondiente según la opción seleccionada
            console.log('✅ [menu] Redirigiendo a opción:', ctx.body.trim());
            switch (ctx.body.trim()) {
                case "1":
                    return gotoFlow(flowConsultas);
                case "2":
                    return gotoFlow(flowUbicacion);
                case "3":
                    return gotoFlow(flowTus15);
                case "4":
                    return gotoFlow(europaFlow);
                case "0":
                    return await flowDynamic("🔄 Saliendo... Puedes volver a este menú escribiendo '*menu*'");
            }
        } catch (err) {
            console.error('❌ [menu] Error:', err?.message || err);
            await flowDynamic("⚠️ Hubo un problema. Escribe *menu* para intentar de nuevo.");
        }
    }
);

module.exports = menuFlow;