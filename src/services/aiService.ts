export class AiService {
    private readonly OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    private readonly MODEL_NAME = 'qwen2.5:1.5b';

    async censorText(text: string): Promise<string> {
        try {
            const prompt = `Eres un moderador de chat muy estricto. Tu única tarea es censurar la palabra "zoe" (y cualquiera de sus variaciones como "Zoe", "ZOE", etc) reemplazándola por "***". Si el texto original NO contiene la palabra "zoe", debes devolver el texto original exactamente igual sin hacer NINGÚN cambio. Bajo ninguna circunstancia debes agregar texto extra, explicaciones, preámbulos, advertencias ni comillas adicionales. RESPONDE ÚNICAMENTE CON EL TEXTO PROCESADO.\n\nTexto a procesar: "${text}"`;

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
                console.warn('Ollama API error, falling back to original text');
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
