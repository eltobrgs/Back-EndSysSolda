import { Router } from 'express';
import { prisma } from '../server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha inválida' });
    }

    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return res.json({
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        role: usuario.role
      },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExiste) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const hashSenha = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashSenha,
        role: role || 'INSTRUTOR'
      }
    });

    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        role: usuario.role
      },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 