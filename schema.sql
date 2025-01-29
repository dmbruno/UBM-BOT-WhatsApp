-- Crear tabla de usuarios (sin contexto)
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    telefono TEXT UNIQUE,
    correo TEXT
    
);

-- Crear tabla de interacciones
CREATE TABLE IF NOT EXISTS interacciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    flujo TEXT,         -- Flujo de interacción (e.g., Fórmula 1, Mundial de Clubes)
    respuesta TEXT,     -- Respuesta específica del usuario
    fecha TEXT,         -- Fecha de la interacción
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS consultas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,    -- Relación con la tabla usuarios
    pasajeros TEXT,                 -- Información sobre pasajeros
    meses_disponibles TEXT,         -- Meses en los que desea viajar
    duracion TEXT,                  -- Duración del viaje
    destino TEXT,                   -- Destino preferido
    fecha TEXT DEFAULT (datetime('now')), -- Fecha de la consulta
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) -- Relación con usuarios
);