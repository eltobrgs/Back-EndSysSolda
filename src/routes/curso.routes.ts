import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middlewares/auth';

const cursoRouter = Router();

cursoRouter.use(authMiddleware);

// Listar todos os cursos
cursoRouter.get('/', async (req: Request, res: Response) => {
  try {
    const cursos = await prisma.curso.findMany({
      include: {
        modulos: {
          include: {
            celulas: true,
          },
        },
        alunos: true,
      },
    });
    return res.json(cursos);
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar curso por ID
cursoRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const curso = await prisma.curso.findUnique({
      where: { id: Number(id) },
      include: {
        modulos: {
          include: {
            celulas: true,
          },
        },
        alunos: true,
      },
    });

    if (!curso) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    return res.json(curso);
  } catch (error) {
    console.error('Erro ao buscar curso:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar curso
cursoRouter.post('/', async (req: Request, res: Response) => {
  const { nome, descricao, cargaHorariaTotal, preRequisitos, materialNecessario, modulos } = req.body;

  try {
    const curso = await prisma.curso.create({
      data: {
        nome,
        descricao,
        cargaHorariaTotal,
        preRequisitos,
        materialNecessario,
        modulos: {
          create: modulos.map((modulo: any) => ({
            nome: modulo.nome,
            descricao: modulo.descricao,
            cargaHorariaTotal: modulo.cargaHorariaTotal,
            celulas: {
              create: modulo.celulas.map((celula: any, index: number) => ({
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
  } catch (error) {
    console.error('Erro ao criar curso:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar curso
cursoRouter.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, descricao, cargaHorariaTotal, preRequisitos, materialNecessario, modulos } = req.body;

  try {
    // Primeiro, excluir todos os módulos existentes (isso excluirá também as células devido ao onDelete: Cascade)
    await prisma.modulo.deleteMany({
      where: { cursoId: Number(id) }
    });

    // Depois, criar os novos módulos com suas células
    const curso = await prisma.curso.update({
      where: { id: Number(id) },
      data: {
        nome,
        descricao,
        cargaHorariaTotal,
        preRequisitos,
        materialNecessario,
        modulos: {
          create: modulos.map((modulo: any) => ({
            nome: modulo.nome,
            descricao: modulo.descricao,
            cargaHorariaTotal: modulo.cargaHorariaTotal,
            celulas: {
              create: modulo.celulas.map((celula: any, index: number) => ({
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
  } catch (error) {
    console.error('Erro ao atualizar curso:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir curso
cursoRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Primeiro, excluir todos os módulos
    await prisma.modulo.deleteMany({
      where: {
        cursoId: Number(id),
      },
    });

    // Por fim, excluir o curso
    await prisma.curso.delete({
      where: { id: Number(id) },
    });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao excluir curso' });
  }
});

export default cursoRouter; 