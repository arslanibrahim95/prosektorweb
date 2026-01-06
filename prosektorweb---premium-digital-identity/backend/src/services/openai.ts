import OpenAI from 'openai';
import { prisma } from '../index.js';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeIndustry = async (industry: string, ipAddress?: string) => {
  try {
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

    Provide the response in Turkish, keep it persuasive and professional.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const analysis = response.choices[0]?.message?.content || '';

    // Save to database for caching
    await prisma.aIAnalysis.create({
      data: {
        industry,
        analysis,
        ipAddress,
      },
    });

    return analysis;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('AI analiz yapılamadı, lütfen tekrar deneyin.');
  }
};

// Cache check - return cached analysis if exists
export const getCachedAnalysis = async (industry: string) => {
  const cached = await prisma.aIAnalysis.findFirst({
    where: { industry },
    orderBy: { createdAt: 'desc' },
  });

  return cached?.analysis || null;
};
