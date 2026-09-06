export class AiService {
    private readonly OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    private readonly MODEL_NAME = 'qwen2.5-coder:1.5b';

    async censorText(text: string): Promise<string> {
        try {
            const prompt = `Eres un filtro de moderación automático. Tu tarea es reemplazar ÚNICAMENTE las palabras soeces, groserías o lenguaje ofensivo con "***", manteniendo EL RESTO DEL TEXTO ABSOLUTAMENTE INTACTO, palabra por palabra.

Ejemplos:
Texto original: "Hola, cómo estás?"
"Hola, cómo estás?"

Texto original: "Eres un completo idiota"
"Eres un completo ***"

Texto original: "Esta mierda no funciona"
"Esta *** no funciona"

NO añadas explicaciones, introducciones ni comillas. RESPONDE SOLO CON EL TEXTO FILTRADO.

Texto original: "\"${text}\""`;

            const response = await fetch(`${this.OLLAMA_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.MODEL_NAME,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.1 // Low temperature for deterministic output
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.warn(`Ollama API error (${response.status}): ${errorText}, falling back to original text`);
                return text; // Fallback
            }

            const data = await response.json();
            
            // Clean up possible quotes added by the AI just in case
            let result = data.response.trim();
            if (result.startsWith('"') && result.endsWith('"') && result.length > 1) {
                result = result.substring(1, result.length - 1);
            }

            return result;
        } catch (error) {
            console.warn('Error communicating with AI service, returning original text:', error);
            return text; // Graceful degradation
        }
    }
}
