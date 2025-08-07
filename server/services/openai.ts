import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface PoemAnalysis {
  description: string;
  poemEnglish: string;
  poemChinese: string;
}

export async function analyzeImageAndGeneratePoem(base64Image: string): Promise<PoemAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a master poet who creates beautiful poetry inspired by images. Analyze the image and create:
1. A detailed description of what you see
2. A beautiful poem in English (4-8 lines, with rhyme and rhythm)
3. A beautiful poem in Chinese (4-8 lines, with traditional poetic structure)

Both poems should capture the essence, mood, and beauty of the image. Use vivid imagery and emotional resonance.

Respond with JSON in this exact format:
{
  "description": "detailed description of the image",
  "poemEnglish": "English poem with line breaks as \\n",
  "poemChinese": "Chinese poem with line breaks as \\n"
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this image and create beautiful poetry inspired by it."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      description: result.description || "A beautiful image",
      poemEnglish: result.poemEnglish || "Silent beauty speaks to the heart,\nNature's art, a work of art.",
      poemChinese: result.poemChinese || "美景如画入心田，\n天地自然皆诗篇。"
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate poem: " + (error as Error).message);
  }
}
