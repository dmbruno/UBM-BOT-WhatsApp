const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const generarExcel = (data, nombreArchivo) => {
    // Crear un libro de Excel
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Datos');

    // Ruta para guardar el archivo en la carpeta correcta
    const archivosPath = path.join(__dirname, '../public/archivos');

    // Verificar si la carpeta existe; si no, crearla
    if (!fs.existsSync(archivosPath)) {
        fs.mkdirSync(archivosPath, { recursive: true });
        console.log('📁 Carpeta creada: public/archivos');
    }

    // Ruta final del archivo
    const filePath = path.join(archivosPath, nombreArchivo);

    // Guardar el archivo
    xlsx.writeFile(workbook, filePath);
    console.log(`✅ Archivo Excel generado en: ${filePath}`);
    return filePath;
};

module.exports = generarExcel;