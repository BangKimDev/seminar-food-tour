
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function translateContent(text: string, targetLang: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following text to ${targetLang}. Return only the translated text.\n\nText: ${text}`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function batchTranslate(text: string, languages: { code: string; name: string }[]): Promise<Record<string, string>> {
  try {
    const langList = languages.map(l => `${l.code}: ${l.name}`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          text: `Translate the following Vietnamese text to ALL of these languages.
Return ONLY a valid JSON object where keys are language codes and values are the translated text.
Do NOT include markdown formatting, code blocks, or any text outside the JSON object.

Languages to translate to:
${langList}

Vietnamese text:
${text}

JSON:`,
        },
      ],
    });

    const raw = response.text || '{}';
    // Extract JSON from response (handle markdown wrapping if any)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : raw);

    // Validate result has expected keys
    const valid: Record<string, string> = {};
    for (const lang of languages) {
      if (result[lang.code] && typeof result[lang.code] === 'string') {
        valid[lang.code] = result[lang.code];
      }
    }
    return valid;
  } catch (error) {
    console.error("Batch translation error:", error);
    return {};
  }
}

function pcmToWav(pcmBase64: string, sampleRate: number = 24000): string {
  const pcmData = atob(pcmBase64);
  const pcmBytes = new Uint8Array(pcmData.length);
  for (let i = 0; i < pcmData.length; i++) {
    pcmBytes[i] = pcmData.charCodeAt(i);
  }

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // RIFF identifier
  view.setUint8(0, 'R'.charCodeAt(0));
  view.setUint8(1, 'I'.charCodeAt(0));
  view.setUint8(2, 'F'.charCodeAt(0));
  view.setUint8(3, 'F'.charCodeAt(0));
  // file length
  view.setUint32(4, 36 + pcmBytes.length, true);
  // RIFF type
  view.setUint8(8, 'W'.charCodeAt(0));
  view.setUint8(9, 'A'.charCodeAt(0));
  view.setUint8(10, 'V'.charCodeAt(0));
  view.setUint8(11, 'E'.charCodeAt(0));
  // format chunk identifier
  view.setUint8(12, 'f'.charCodeAt(0));
  view.setUint8(13, 'm'.charCodeAt(0));
  view.setUint8(14, 't'.charCodeAt(0));
  view.setUint8(15, ' '.charCodeAt(0));
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (PCM = 1)
  view.setUint16(20, 1, true);
  // channel count (Mono = 1)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  view.setUint8(36, 'd'.charCodeAt(0));
  view.setUint8(37, 'a'.charCodeAt(0));
  view.setUint8(38, 't'.charCodeAt(0));
  view.setUint8(39, 'a'.charCodeAt(0));
  // data chunk length
  view.setUint32(40, pcmBytes.length, true);

  const wavBytes = new Uint8Array(44 + pcmBytes.length);
  wavBytes.set(new Uint8Array(wavHeader), 0);
  wavBytes.set(pcmBytes, 44);

  let binary = '';
  for (let i = 0; i < wavBytes.length; i++) {
    binary += String.fromCharCode(wavBytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

export async function generateTTS(text: string, voice: string = 'Kore') {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return pcmToWav(base64Audio);
    }
    return null;
  } catch (error) {
    console.error("TTS error:", error);
    return null;
  }
}
