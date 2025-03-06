import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middlewares/auth';
import { z } from 'zod';

const moduloRouter = Router();

moduloRouter.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const modulos = await prisma.modulo.findMany({
      include: {
        celulas: true
      }
    });
    return res.json(modulos);
  } catch (err: unknown) {
    console.error('Erro ao buscar módulos:', err);
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao buscar módulos' });
  }
});

moduloRouter.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const modulo = await prisma.modulo.findUnique({
      where: { id: Number(id) },
      include: {
        celulas: true
      }
    });
    if (!modulo) {
      return res.status(404).json({ error: 'Módulo não encontrado' });
    }
    return res.json(modulo);
  } catch (err: unknown) {
    console.error('Erro ao buscar módulo:', err);
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao buscar módulo' });
  }
});

const createModuloSchema = z.object({
  nome: z.string(),
  descricao: z.string(),
  cargaHorariaTotal: z.number(),
  cursoId: z.number(),
  celulas: z.array(z.object({
    ordem: z.number(),
    siglaTecnica: z.string()
  }))
});

moduloRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createModuloSchema.parse(req.body);
    const { celulas, ...moduloData } = data;

    const modulo = await prisma.modulo.create({
      data: {
        ...moduloData,
        celulas: {
          create: celulas.map(celula => ({
            ordem: celula.ordem,
            siglaTecnica: celula.siglaTecnica
          }))
        }
      },
      include: {
        celulas: true
      }
    });

    return res.status(201).json(modulo);
  } catch (err: unknown) {
    console.error('Erro ao criar módulo:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao criar módulo' });
  }
});

const updateModuloSchema = createModuloSchema;

moduloRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateModuloSchema.parse(req.body);
    const { celulas, ...moduloData } = data;

    // Primeiro, exclui todas as células existentes
    await prisma.celula.deleteMany({
      where: { moduloId: Number(id) }
    });

    // Depois, atualiza o módulo e cria as novas células
    const modulo = await prisma.modulo.update({
      where: { id: Number(id) },
      data: {
        ...moduloData,
        celulas: {
          create: celulas.map(celula => ({
            ordem: celula.ordem,
            siglaTecnica: celula.siglaTecnica
          }))
        }
      },
      include: {
        celulas: true
      }
    });

    return res.json(modulo);
  } catch (err: unknown) {
    console.error('Erro ao atualizar módulo:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao atualizar módulo' });
  }
});

moduloRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.modulo.delete({
      where: { id: Number(id) }
    });
    return res.status(204).send();
  } catch (err: unknown) {
    console.error('Erro ao excluir módulo:', err);
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao excluir módulo' });
  }
});

export default moduloRouter; 