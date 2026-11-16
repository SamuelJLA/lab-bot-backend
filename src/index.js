import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { cargarExamenesDesdeGoogleSheets, cargarInfoGeneralDesdeGoogleSheets } from './services/excelParser.js';
import { responderConsultaLaboratorio } from './services/aiEngine.js';
dotenv.config();
const app = express();
// Permite que la página web (local o Firebase) se conecte a este servidor
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
let catalogoExamenes = [];
let infoGeneral = [];
async function sincronizarDatos() {
    try {
        console.log('🔄 Sincronizando datos desde Google Sheets...');
        catalogoExamenes = await cargarExamenesDesdeGoogleSheets();
        infoGeneral = await cargarInfoGeneralDesdeGoogleSheets();
        console.log(`✅ Sincronizados ${catalogoExamenes.length} exámenes y ${infoGeneral.length} reglas de información general.`);
    }
    catch (error) {
        console.error('❌ Error durante la sincronización:', error);
    }
}
// Ruta de verificación rápida en el navegador
app.get('/', (req, res) => {
    res.json({
        estado: 'Servidor del Laboratorio activo 🚀',
        examenesCargados: catalogoExamenes.length,
        reglasCargadas: infoGeneral.length
    });
});
app.get('/api/sync-sheet', async (req, res) => {
    await sincronizarDatos();
    res.json({
        mensaje: 'Sincronización completada',
        totalExamenes: catalogoExamenes.length,
        totalInfoGeneral: infoGeneral.length
    });
});
app.post('/api/chat', async (req, res) => {
    const { mensaje } = req.body;
    if (!mensaje) {
        res.status(400).json({ error: 'El campo "mensaje" es obligatorio.' });
        return;
    }
    if (catalogoExamenes.length === 0) {
        await sincronizarDatos();
    }
    const respuesta = await responderConsultaLaboratorio(mensaje, catalogoExamenes, infoGeneral);
    res.json({ respuesta });
});
app.listen(PORT, async () => {
    console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
    await sincronizarDatos();
});
//# sourceMappingURL=index.js.map