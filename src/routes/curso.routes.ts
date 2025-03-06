import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middlewares/auth';
import { z } from 'zod';

const cursoRouter = Router();

cursoRouter.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const cursos = await prisma.curso.findMany({
      include: {
        modulos: {
          include: {
            celulas: true
          }
        }
      }
    });
    return res.json(cursos);
  } catch (err: unknown) {
    console.error('Erro ao buscar cursos:', err);
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao buscar cursos' });
  }
});

cursoRouter.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const curso = await prisma.curso.findUnique({
      where: { id: Number(id) },
      include: {
        modulos: {
          include: {
            celulas: true
          }
        }
      }
    });
    if (!curso) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }
    return res.json(curso);
  } catch (err: unknown) {
    console.error('Erro ao buscar curso:', err);
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao buscar curso' });
  }
});

const createCursoSchema = z.object({
  nome: z.string(),
  descricao: z.string(),
  cargaHorariaTotal: z.number(),
  preRequisitos: z.string().nullable(),
  materialNecessario: z.string().nullable(),
  modulos: z.array(z.object({
    nome: z.string(),
    descricao: z.string(),
    cargaHorariaTotal: z.number(),
    celulas: z.array(z.object({
      ordem: z.number(),
      siglaTecnica: z.string()
    }))
  }))
});

cursoRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createCursoSchema.parse(req.body);
    const { modulos, ...cursoData } = data;

    const curso = await prisma.curso.create({
      data: {
        ...cursoData,
        modulos: {
          create: modulos.map(modulo => ({
            nome: modulo.nome,
            descricao: modulo.descricao,
            cargaHorariaTotal: modulo.cargaHorariaTotal,
            celulas: {
              create: modulo.celulas.map(celula => ({
                ordem: celula.ordem,
                siglaTecnica: celula.siglaTecnica
              }))
            }
          }))
        }
      },
      include: {
        modulos: {
          include: {
            celulas: true
          }
        }
      }
    });

    return res.status(201).json(curso);
  } catch (err: unknown) {
    console.error('Erro ao criar curso:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao criar curso' });
  }
});

const updateCursoSchema = createCursoSchema;

cursoRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateCursoSchema.parse(req.body);
    const { modulos, ...cursoData } = data;

    // Primeiro, exclui todos os módulos existentes
    await prisma.modulo.deleteMany({
      where: { cursoId: Number(id) }
    });

    // Depois, atualiza o curso e cria os novos módulos
    const curso = await prisma.curso.update({
      where: { id: Number(id) },
      data: {
        ...cursoData,
        modulos: {
          create: modulos.map(modulo => ({
            nome: modulo.nome,
            descricao: modulo.descricao,
            cargaHorariaTotal: modulo.cargaHorariaTotal,
            celulas: {
              create: modulo.celulas.map(celula => ({
                ordem: celula.ordem,
                siglaTecnica: celula.siglaTecnica
              }))
            }
          }))
        }
      },
      include: {
        modulos: {
          include: {
            celulas: true
          }
        }
      }
    });

    return res.json(curso);
  } catch (err: unknown) {
    console.error('Erro ao atualizar curso:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao atualizar curso' });
  }
});

cursoRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.curso.delete({
      where: { id: Number(id) }
    });
    return res.status(204).send();
  } catch (err: unknown) {
    console.error('Erro ao excluir curso:', err);
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao excluir curso' });
  }
});

export default cursoRouter; 