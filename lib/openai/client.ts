import OpenAI from "openai";

export function createOpenAIClient(apiKey?: string): OpenAI | null {
  const key = apiKey || process.env.OPENAI_API_KEY;

  if (!key) {
    return null;
  }

  return new OpenAI({
    apiKey: key,
  });
}

export async function generateMarketAnalysis(
  newsContext: string,
  apiKey?: string
): Promise<string> {
  const client = createOpenAIClient(apiKey);

  if (!client) {
    throw new Error("OpenAI API key not configured");
  }

  const response = await client.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are a financial market analyst. Provide concise, objective market analysis based on recent news. Focus on: 1) Key market drivers, 2) Potential risks, 3) Opportunities. Do NOT provide financial advice or recommendations to buy/sell. Use professional, neutral language.",
      },
      {
        role: "user",
        content: `Analyze the following market news and provide key insights:\n\n${newsContext}`,
      },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "Unable to generate analysis";
}

export async function generateMarketDrivers(
  newsContext: string,
  timeframe: "today" | "week" | "month",
  apiKey?: string
): Promise<any[]> {
  const client = createOpenAIClient(apiKey);

  if (!client) {
    throw new Error("OpenAI API key not configured");
  }

  const response = await client.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are a financial market analyst. Generate a JSON array of market drivers based on recent news. Each driver should have: title, description, impact (high/medium/low), direction (bullish/bearish/neutral), affectedAssets (array of symbols), confidence (0-1), and sources. Do NOT provide financial advice.",
      },
      {
        role: "user",
        content: `Generate market drivers for ${timeframe} based on this news:\n\n${newsContext}`,
      },
    ],
    max_tokens: 1000,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return [];

  try {
    const parsed = JSON.parse(content);
    return parsed.drivers || [];
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return [];
  }
}
