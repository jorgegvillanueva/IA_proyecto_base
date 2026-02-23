export type SuggestionResult = {
  impact: number;
  confidence: number;
  ease: number;
  justification: string;
};

const GEMINI_API_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const SYSTEM_INSTRUCTION = `Eres un asistente experto en priorización de tareas usando el método ICE (Impact, Confidence, Ease).
Tu tarea es analizar una descripción de tarea y sugerir valores numéricos para cada dimensión (0-10).`;

const USER_PROMPT_TEMPLATE = (title: string, description: string) => `
Analiza esta tarea y sugiere valores ICE (Impact, Confidence, Ease) del 0 al 10:

Título: ${title}
Descripción: ${description}

Responde ÚNICAMENTE con un objeto JSON válido en este formato exacto:
{
  "impact": <número 0-10>,
  "confidence": <número 0-10>,
  "ease": <número 0-10>,
  "justification": "<máximo 150 caracteres explicando brevemente>"
}

No incluyas markdown, comentarios ni texto adicional.
`;

function validateSuggestion(data: unknown): SuggestionResult {
  if (
    !data ||
    typeof data !== 'object' ||
    !('impact' in data) ||
    !('confidence' in data) ||
    !('ease' in data) ||
    !('justification' in data)
  ) {
    throw new Error('Respuesta de IA inválida: estructura JSON incorrecta.');
  }

  const obj = data as Record<string, unknown>;
  const impact = Number(obj.impact);
  const confidence = Number(obj.confidence);
  const ease = Number(obj.ease);
  const justification = String(obj.justification);

  if (
    !Number.isInteger(impact) ||
    impact < 0 ||
    impact > 10 ||
    !Number.isInteger(confidence) ||
    confidence < 0 ||
    confidence > 10 ||
    !Number.isInteger(ease) ||
    ease < 0 ||
    ease > 10
  ) {
    throw new Error('Valores ICE fuera de rango (0-10).');
  }

  if (!justification.trim()) {
    throw new Error('Justificación vacía.');
  }

  return { impact, confidence, ease, justification: justification.slice(0, 150) };
}

export async function getSuggestedICE(
  apiKey: string,
  title: string,
  description: string,
): Promise<SuggestionResult> {
  if (!apiKey.trim()) {
    throw new Error('API Key de Gemini no configurada.');
  }

  if (!title.trim()) {
    throw new Error('Título requerido para sugerir ICE.');
  }

  const url = `${GEMINI_API_ENDPOINT}?key=${encodeURIComponent(apiKey)}`;

  const body = {
    system_instruction: {
      parts: {
        text: SYSTEM_INSTRUCTION,
      },
    },
    contents: {
      parts: {
        text: USER_PROMPT_TEMPLATE(title, description),
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message =
        error?.error?.message ?? `Error de Gemini API (${response.status})`;
      throw new Error(message);
    }

    const data = await response.json();

    // Extract text from Gemini response
    const textContent =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!textContent) {
      throw new Error('Respuesta vacía de Gemini API.');
    }

    // Parse JSON from response (may contain markdown code blocks)
    let suggestion: unknown;
    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch?.[0] ?? textContent;
      suggestion = JSON.parse(jsonStr);
    } catch {
      throw new Error('No se pudo parsear JSON de la respuesta de IA.');
    }

    return validateSuggestion(suggestion);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al contactar Gemini API.');
  }
}
