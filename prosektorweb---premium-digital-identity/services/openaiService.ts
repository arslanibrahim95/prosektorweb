import OpenAI from 'openai';

const getAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true // Frontend kullanımı için gerekli
  });
};

export const analyzeIndustry = async (industry: string) => {
  const client = getAIClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: `Analyze the digital landscape for the "${industry}" industry.
    Explain why a strong digital identity is crucial for this sector.
    Suggest which of these 3 design themes would be best for them and why:
    1. Prestij (Corporate & Authoritative)
    2. Aksiyon (Dynamic & Fast)
    3. Vizyon (Modern & Innovative)

    Provide the response in Turkish, keep it persuasive and professional.`
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  return response.choices[0]?.message?.content || '';
};
