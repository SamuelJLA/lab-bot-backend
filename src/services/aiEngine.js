import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.OPENROUTER_API_KEY || '';
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Lab Bot Service'
    }
});
export async function responderConsultaLaboratorio(preguntaUsuario, catalogoExamenes, infoGeneral = []) {
    if (!apiKey) {
        console.error('❌ ERROR: OPENROUTER_API_KEY no está configurada en el .env');
        return 'Error de configuración en el servidor. Falta la API Key.';
    }
    const preguntaLower = preguntaUsuario.toLowerCase();
    // 1. Filtrar exámenes coincidentes
    const examenesCoincidentes = catalogoExamenes.filter((ex) => {
        return (ex.alias.some((alias) => alias.length > 2 && preguntaLower.includes(alias)) ||
            ex.nombre.toLowerCase().split(' ').some((palabra) => palabra.length > 3 && preguntaLower.includes(palabra)));
    });
    const listaExamenes = (examenesCoincidentes.length > 0 ? examenesCoincidentes : catalogoExamenes.slice(0, 30))
        .map((e) => `- ${e.nombre} (Código: ${e.alias[1]}): $${e.precio_usd} USD | Entrega: ${e.tiempo_entrega}`)
        .join('\n');
    // 2. Formatear la información general del laboratorio
    const listaInfoGeneral = infoGeneral.length > 0
        ? infoGeneral.map((info) => `- [${info.clave}] ${info.concepto}: ${info.detalle}`).join('\n')
        : 'No hay información general registrada en este momento.';
    // 3. Prompt estricto combinando ambas fuentes de datos
    const systemPrompt = `
Eres el asistente virtual oficial del Laboratorio Clínico. Tu objetivo es informar a los clientes de forma clara, amable y precisa.

POLÍTICAS Y DATOS GENERALES DEL LABORATORIO:
${listaInfoGeneral}

CATÁLOGO DE EXÁMENES DISPONIBLES:
${listaExamenes}

REGLAS STRICTAS:
1. Responde basándote ÚNICAMENTE en la información anterior. Si la pregunta es sobre precios/exámenes y no aparece en la lista, di amablemente que no posees la información y ofrece conectar con un bioanalista.
2. Si la pregunta es sobre Cashea, métodos de pago, ubicación, promociones o ayuno, usa la sección de POLÍTICAS Y DATOS GENERALES.
3. NUNCA inventes precios, porcentajes, horarios ni promociones que no estén explícitamente escritos.
4. Responde de forma concisa, educada y lista para chats.
  `;
    try {
        const response = await openai.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: preguntaUsuario }
            ],
            temperature: 0.2
        });
        return response.choices[0]?.message?.content || 'Disculpa, no pude procesar tu solicitud.';
    }
    catch (error) {
        console.error('❌ Error en OpenRouter:', error.message || error);
        return 'En este momento estamos experimentando una breve interrupción. Por favor reintenta en unos momentos.';
    }
}
//# sourceMappingURL=aiEngine.js.map