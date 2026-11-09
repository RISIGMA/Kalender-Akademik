import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, nim, phone, role = 'user', orgName, orgDesc } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan kata sandi wajib diisi.'
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = ['user', 'organizer'].includes(role) ? role : 'user';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: assignedRole,
        nim,
        phone
      }
    });

    if (assignedRole === 'organizer' && orgName) {
      await prisma.organization.create({
        data: {
          userId: user.id,
          name: orgName,
          description: orgDesc || '',
          status: 'approved'
        }
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      nim: user.nim
    };

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil.',
      token,
      user: userData,
      data: {
        token,
        user: userData
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan kata sandi wajib diisi.'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
      include: { organization: true }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Email atau kata sandi tidak sesuai.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Email atau kata sandi tidak sesuai.'
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      nim: user.nim,
      phone: user.phone,
      organization: user.organization
    };

    return res.json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: userData,
      data: {
        token,
        user: userData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
};

export const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      nim: req.user.nim,
      phone: req.user.phone,
      organization: req.user.organization
    },
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      nim: req.user.nim,
      phone: req.user.phone,
      organization: req.user.organization
    }
  });
};
