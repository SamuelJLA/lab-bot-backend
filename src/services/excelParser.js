export async function cargarExamenesDesdeGoogleSheets(urlCsv) {
    const url = urlCsv || process.env.GOOGLE_SHEET_CSV_URL;
    if (!url) {
        throw new Error('No se ha configurado la URL de Google Sheets en GOOGLE_SHEET_CSV_URL');
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error al obtener los datos de exámenes: ${response.statusText}`);
    }
    const contenido = await response.text();
    const lineas = contenido.split(/\r?\n/);
    const examenes = [];
    for (let i = 1; i < lineas.length; i++) {
        const linea = lineas[i]?.trim();
        if (!linea)
            continue;
        const columnas = linea.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
        if (columnas.length < 4)
            continue;
        const codigo = columnas[0]?.replace(/"/g, '').trim() || '';
        const nombreRaw = columnas[1]?.replace(/"/g, '').trim() || '';
        const diasRaw = columnas[2]?.replace(/"/g, '').trim() || '1';
        const precioRaw = columnas[3]?.replace(/"/g, '').trim() || '0';
        if (!nombreRaw)
            continue;
        const precio = parseFloat(precioRaw) || 0;
        const dias = parseInt(diasRaw, 10) || 0;
        const id = nombreRaw
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        examenes.push({
            id,
            nombre: nombreRaw,
            alias: [nombreRaw.toLowerCase(), codigo],
            precio_usd: precio,
            acepta_cashea: false,
            condiciones: 'Consultar especificaciones de muestra y ayuno con el laboratorio.',
            tiempo_entrega: dias === 0 ? 'Mismo día' : `${dias} día(s) hábil(es)`,
            incluye: [],
            activo: true
        });
    }
    return examenes;
}
export async function cargarInfoGeneralDesdeGoogleSheets(urlCsv) {
    const url = urlCsv || process.env.GOOGLE_SHEET_INFO_CSV_URL;
    if (!url) {
        console.warn('⚠️ No se ha configurado GOOGLE_SHEET_INFO_CSV_URL');
        return [];
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error al obtener datos generales: ${response.statusText}`);
        }
        const contenido = await response.text();
        const lineas = contenido.split(/\r?\n/);
        const registros = [];
        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i]?.trim();
            if (!linea)
                continue;
            const columnas = linea.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
            if (columnas.length < 3)
                continue;
            const clave = columnas[0]?.replace(/"/g, '').trim() || '';
            const concepto = columnas[1]?.replace(/"/g, '').trim() || '';
            const detalle = columnas[2]?.replace(/"/g, '').trim() || '';
            if (clave && detalle) {
                registros.push({ clave, concepto, detalle });
            }
        }
        return registros;
    }
    catch (error) {
        console.error('❌ Error al cargar INFO_GENERAL:', error);
        return [];
    }
}
//# sourceMappingURL=excelParser.js.map