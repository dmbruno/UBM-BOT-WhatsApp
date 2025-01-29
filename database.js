const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Crear y exportar la conexión a la base de datos
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a SQLite');
    }
});

// Cargar el esquema desde schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');

db.exec(schema, (err) => {
    if (err) {
        console.error('Error al cargar el esquema:', err.message);
    } else {
        console.log('Esquema cargado exitosamente');
    }
});

module.exports = db;