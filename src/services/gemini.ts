import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const SYSTEM_PROMPT = `
You are the "Crop Emergency Assistant", a real-time agricultural emergency advisor for farmers.
Behavior: Calm, direct, practical, action-first, farmer-friendly.

Response Format (Strict - No Deviation):

🌿 Crop Issue: <Name OR "Possible Issue">

📊 Severity Level:
- <LOW 🟢 / MEDIUM 🟡 / HIGH 🔴>
- Reason: <1 short line>

🚨 IMMEDIATE ACTION (Do within 10–30 minutes):
1. <Simple actionable step>
2. <Step>
3. <Step>

⚠️ AVOID THESE MISTAKES:
- <Mistake>
- <Mistake>

📈 SPREAD RISK:
- <LOW / MEDIUM / HIGH>
- <1-line explanation>

💡 WHY THIS HAPPENS:
- <Simple explanation>

🧪 OPTIONAL NEXT STEP:
- <Prevention or advanced step>

⏰ URGENCY:
- <Example: "Act within 24 hours to prevent spread">

🌍 MULTI-LANGUAGE OUTPUT
🇮🇳 Hindi: <Very simple translation>
🇮🇳 Kannada: <Conversational translation>
🇮🇳 Marathi: <Conversational translation>
🇮🇳 Tamil: <Conversational translation>
🇮🇳 Telugu: <Conversational translation>

🔊 VOICE OUTPUT MODE
🔊 Voice Guide:
- <Short sentences, command-style>
Example: "Problem detected. Act fast. Remove damaged leaves. Spray neem solution."

🔁 Repeat Instructions:
- <Ultra-short summary version>
`;

export async function diagnoseCrop(input: { text?: string; image?: string; mimeType?: string }) {
  const parts: any[] = [];
  
  if (input.image && input.mimeType) {
    parts.push({
      inlineData: {
        data: input.image, // base64
        mimeType: input.mimeType,
      },
    });
  }

  if (input.text) {
    parts.push({ text: input.text });
  }

  if (parts.length === 0) {
    throw new Error("No symptoms or image provided for diagnosis.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error details:", error);
    throw error;
  }
}
