import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middlewares/auth';
import { z } from 'zod';

const celulaRouter = Router();

celulaRouter.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const celulas = await prisma.celula.findMany({
      include: {
        modulo: true,
        presencas: true
      }
    });
    return res.json(celulas);
  } catch (err: unknown) {
    console.error('Erro ao buscar células:', err);
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao buscar células' });
  }
});

celulaRouter.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const celula = await prisma.celula.findUnique({
      where: { id: Number(id) },
      include: {
        modulo: true,
        presencas: true
      }
    });
    if (!celula) {
      return res.status(404).json({ error: 'Célula não encontrada' });
    }
    return res.json(celula);
  } catch (err: unknown) {
    console.error('Erro ao buscar célula:', err);
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao buscar célula' });
  }
});

const createCelulaSchema = z.object({
  ordem: z.number(),
  siglaTecnica: z.string(),
  moduloId: z.number()
});

celulaRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createCelulaSchema.parse(req.body);
    const celula = await prisma.celula.create({
      data,
      include: {
        modulo: true
      }
    });
    return res.status(201).json(celula);
  } catch (err: unknown) {
    console.error('Erro ao criar célula:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao criar célula' });
  }
});

const updateCelulaSchema = createCelulaSchema;

celulaRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateCelulaSchema.parse(req.body);
    const celula = await prisma.celula.update({
      where: { id: Number(id) },
      data,
      include: {
        modulo: true
      }
    });
    return res.json(celula);
  } catch (err: unknown) {
    console.error('Erro ao atualizar célula:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao atualizar célula' });
  }
});

celulaRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.celula.delete({
      where: { id: Number(id) }
    });
    return res.status(204).send();
  } catch (err: unknown) {
    console.error('Erro ao excluir célula:', err);
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao excluir célula' });
  }
});

export default celulaRouter; 