# Problema con LID (Local Identifier) en WhatsApp

## ¿Qué es un LID?

WhatsApp usa dos tipos de identificadores:

1. **JID (Jabber ID)**: `5493875051112@s.whatsapp.net` 
   - Número real del usuario
   - Se usa para contactos guardados o que ya interactuaron

2. **LID (Local Identifier)**: `276235217326164@lid`
   - Identificador temporal
   - Se usa para contactos **NUEVOS** o **NO GUARDADOS**
   - WhatsApp genera este ID internamente

## El Problema

El framework `@bot-whatsapp/bot` con **Baileys NO PROCESA correctamente mensajes con LID**.

**Síntomas:**
- ✅ Mensajes de números registrados funcionan (usan JID)
- ❌ Mensajes de números nuevos NO funcionan (usan LID)
- Los mensajes LLEGAN al bot pero NO se ejecuta ningún flujo
- Error: `UNHANDLED REJECTION - undefined`

## ¿Por qué pasa esto?

Baileys tiene limitaciones con LID:
- No puede enviar mensajes directamente a LID
- Los flujos con `addKeyword` no se activan con LID
- `capture: true` no funciona con LID

## Soluciones

### Solución 1: Agregar el contacto (RECOMENDADO)

**En el teléfono conectado al bot:**
1. Guarda el número del cliente en tus contactos
2. Espera ~30 segundos
3. WhatsApp convertirá el LID a JID automáticamente
4. El bot funcionará normalmente

### Solución 2: Pedir que el usuario te escriba primero

Cuando un contacto NUEVO te escribe por primera vez, WhatsApp usa LID. Pero si:
1. Tú le respondes manualmente primero (desde WhatsApp)
2. O el usuario te escribe varias veces
3. WhatsApp puede convertir el LID a JID

### Solución 3: Usar WhatsApp Business API (PAGO)

La API oficial de WhatsApp Business NO tiene este problema porque:
- No usa Baileys (usa API oficial)
- Maneja todos los contactos correctamente
- Costo: ~$0.005 por mensaje

## Limitaciones Actuales del Bot

**Con LID (contactos nuevos):**
- ❌ NO responde automáticamente
- ❌ NO ejecuta flujos
- ❌ NO puede capturar respuestas

**Con JID (contactos conocidos):**
- ✅ Responde automáticamente
- ✅ Ejecuta todos los flujos
- ✅ Captura respuestas correctamente

## Recomendación

Para un bot de atención al cliente que recibe MUCHOS contactos nuevos:

1. **Corto plazo**: Agrega los números importantes a contactos
2. **Mediano plazo**: Considera migrar a WhatsApp Business API
3. **Alternativa**: Usa otro framework que soporte mejor LID (ej: Baileys directo con handlers personalizados)

## Referencias

- Baileys GitHub: https://github.com/WhiskeySockets/Baileys
- @bot-whatsapp/bot: https://github.com/codigoencasa/bot-whatsapp
- WhatsApp Business API: https://business.whatsapp.com/products/business-platform

## Estado Actual

**Fecha**: 8 de enero de 2026
**Framework**: @bot-whatsapp/bot v0.1.38
**Provider**: Baileys v6.6.0
**Estado**: LID no soportado correctamente por el framework
