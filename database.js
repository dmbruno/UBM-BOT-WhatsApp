import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear y exportar la conexión a la base de datos
const db = new (sqlite3.verbose()).Database('./database.db', (err) => {
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

export default db;