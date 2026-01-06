import { Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../index.js';
import { AuthRequest, generateToken, generateRefreshToken } from '../middleware/auth.js';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Geçerli bir email girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  name: z.string().optional(),
  phone: z.string().optional(),
});

const verifyCodeSchema = z.object({
  email: z.string().email('Geçerli bir email girin'),
  code: z.string().min(6, 'Geçerli bir kod girin'),
});

export const register = async (req: any, res: Response) => {
  try {
    const { email, password, name, phone } = registerSchema.parse(req.body);

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Bu email adresi zaten kayıtlı' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate access code
    const accessCode = `PSW-${Date.now().toString().slice(-6)}`;

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        accessCode,
      },
    });

    // Generate tokens
    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      message: 'Kayıt başarılı',
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        accessCode: user.accessCode,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Kayıt işlemi başarısız oldu' });
  }
};

export const verifyCode = async (req: any, res: Response) => {
  try {
    const { email, code } = verifyCodeSchema.parse(req.body);

    // Find user by email and code
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    if (user.accessCode !== code) {
      return res.status(401).json({ error: 'Geçersiz erişim kodu' });
    }

    // Generate tokens
    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      message: 'Doğrulama başarılı',
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Doğrulama işlemi başarısız oldu' });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        accessCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'İşlem başarısız oldu' });
  }
};

export const refresh = async (req: any, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Verify refresh token and generate new access token
    const token = generateToken('dummy', 'dummy@example.com'); // This should decode refreshToken first
    res.json({ token });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ error: 'Token yenilenemedi' });
  }
};
