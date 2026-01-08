const { addKeyword } = require('@bot-whatsapp/bot');
const flowConsultas = require('./consultas'); // Flujo de consultas
const flowUbicacion = require('./ubicacion'); // Flujo de ubicación
const flowAdmin = require('./admin'); // Flujo de administrador
const flowTus15 = require('./flowTus15'); // Flujo para "Tus 15 con UBM"
// const flowTurquiaYEgeo = require('./flowTurquiaYEgeo'); // Flujo para Machu Picchu
const europaFlow = require('./Europa/europaFlow'); // Flujo para "UBM Ola EUROPA"
// const restoMundoFlow = require('./RestoDelMundo/restoDelMundoFlow'); // Flujo para "Grupales - Resto del Mundo"

const menuFlow = addKeyword(["Menu", "Menú", "menu", "menú"])
    .addAnswer(
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
        null,
        async (ctx, { }) => {
            console.log('========================================');
            console.log('📋 [menuFlow] MENU MOSTRADO');
            console.log('📋 [menuFlow] ctx.from:', ctx.from);
            console.log('📋 [menuFlow] ctx.body:', ctx.body);
            console.log('========================================');
        }
    )
    .addAnswer(
        null,
        { capture: true },
        async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
            console.log('========================================');
            console.log('📋 [menuFlow] CAPTURA DE OPCIÓN');
            console.log('📋 [menuFlow] ctx.from:', ctx.from);
            console.log('📋 [menuFlow] ctx.body:', ctx.body);
            console.log('📋 [menuFlow] Opción recibida:', ctx.body);
            console.log('========================================');
            
            try {
                const input = ctx.body.trim().toLowerCase();
                console.log('📋 [menuFlow] Input procesado:', input);

                // Validar si el input es 'admin'
                if (input === "admin") {
                    console.log('🔐 [menuFlow] Admin acceso');
                    return gotoFlow(flowAdmin);
                }

                // Validar si la entrada es una opción válida
                if (!["1", "2", "3", "4", "0"].includes(ctx.body.trim())) {
                    console.log('⚠️ [menuFlow] Opción inválida:', ctx.body.trim());
                    return fallBack("⚠️ Respuesta no válida. Por favor selecciona una de las opciones.");
                }

                // Redirigir al flujo correspondiente según la opción seleccionada
                console.log('✅ [menuFlow] Redirigiendo a opción:', ctx.body.trim());
                switch (ctx.body.trim()) {
                    case "1":
                        console.log('➡️ [menuFlow] Ir a flowConsultas');
                        return gotoFlow(flowConsultas);
                    case "2":
                        console.log('➡️ [menuFlow] Ir a flowUbicacion');
                        return gotoFlow(flowUbicacion);
                    case "3":
                        console.log('➡️ [menuFlow] Ir a flowTus15');
                        return gotoFlow(flowTus15);
                    case "4":
                        console.log('➡️ [menuFlow] Ir a europaFlow');
                        return gotoFlow(europaFlow);
                    case "0":
                        console.log('🔄 [menuFlow] Saliendo...');
                        return await flowDynamic("🔄 Saliendo... Puedes volver a este menú escribiendo '*menu*'");
                }
            } catch (err) {
                console.error('❌❌❌ [menuFlow] ERROR ❌❌❌');
                console.error('❌ Error completo:', err);
                console.error('❌ Error message:', err?.message);
                console.error('❌ Error stack:', err?.stack);
                await flowDynamic("⚠️ Hubo un problema. Escribe *menu* para intentar de nuevo.");
            }
            
            console.log('🏁 [menuFlow] Fin de captura de opción');
        }
    );

module.exports = menuFlow;