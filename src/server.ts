import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Rotas
import authRoutes from './routes/auth.routes';
import alunoRoutes from './routes/aluno.routes';
import cursoRoutes from './routes/curso.routes';
import moduloRoutes from './routes/modulo.routes';
import celulaRoutes from './routes/celula.routes';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/modulos', moduloRoutes);
app.use('/api/celulas', celulaRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 