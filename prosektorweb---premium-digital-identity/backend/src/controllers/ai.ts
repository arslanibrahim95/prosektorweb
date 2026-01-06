import { Request, Response } from 'express';
import { z } from 'zod';
import { analyzeIndustry, getCachedAnalysis } from '../services/openai.js';

const analyzeSchema = z.object({
  industry: z.string().min(2, 'Sektör adı en az 2 karakter olmalı').max(100),
});

export const analyze = async (req: Request, res: Response) => {
  try {
    const { industry } = analyzeSchema.parse(req.body);
    const ipAddress = req.ip || req.socket.remoteAddress;

    // Check cache first
    const cached = await getCachedAnalysis(industry);
    if (cached) {
      return res.json({
        analysis: cached,
        cached: true,
      });
    }

    // Get fresh analysis from OpenAI
    const analysis = await analyzeIndustry(industry, ipAddress);

    res.json({
      analysis,
      cached: false,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'Analiz yapılamadı, lütfen tekrar deneyin.' });
  }
};
