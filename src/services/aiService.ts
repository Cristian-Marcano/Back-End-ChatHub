export class AiService {
    private readonly OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    private readonly MODEL_NAME = 'qwen2.5-coder:1.5b';

    async censorText(text: string): Promise<string> {
        try {
            const prompt = `Eres un filtro de moderación automático. Tu tarea es reemplazar ÚNICAMENTE las palabras soeces, groserías o lenguaje ofensivo con "***". EL RESTO DEL TEXTO DEBE MANTENERSE ABSOLUTAMENTE INTACTO.

Debes responder ÚNICAMENTE con un objeto JSON válido con una sola propiedad "censored_text" que contenga el resultado.

Ejemplos:
Texto: "Hola, cómo estás?"
{"censored_text": "Hola, cómo estás?"}

Texto: "Eres un completo idiota"
{"censored_text": "Eres un completo ***"}

Texto: "${text}"`;

            const response = await fetch(`${this.OLLAMA_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.MODEL_NAME,
                    prompt: prompt,
                    stream: false,
                    format: "json",
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
            let resultText = text;
            try {
                // Find the first { and last } to extract JSON in case the model adds extra text
                const responseStr = data.response.trim();
                const jsonStart = responseStr.indexOf('{');
                const jsonEnd = responseStr.lastIndexOf('}');
                
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    const jsonStr = responseStr.substring(jsonStart, jsonEnd + 1);
                    const parsed = JSON.parse(jsonStr);
                    if (parsed.censored_text) {
                        resultText = parsed.censored_text;
                    }
                }
            } catch (e) {
                console.warn('Failed to parse JSON from AI response, using original text');
            }
            
            // Anti-hallucination safeguard for small models
            if (resultText === '***' && text.split(' ').length > 1) {
                return text;
            }

            return resultText;
        } catch (error) {
            console.warn('Error communicating with AI service, returning original text:', error);
            return text; // Graceful degradation
        }
    }
}
