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
            aulas: true,
            alunoModulos: true,
          },
        },
        alunos: true,
      },
    });
    return res.json(cursos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar cursos' });
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
            aulas: true,
            alunoModulos: true,
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
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar curso' });
  }
});

// Criar curso
cursoRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { nome, descricao, cargaHorariaTotal, preRequisitos, materialNecessario, modulos } = req.body;

    const curso = await prisma.curso.create({
      data: {
        nome,
        descricao,
        cargaHorariaTotal,
        preRequisitos,
        materialNecessario,
        modulos: {
          create: modulos?.map((modulo: any) => ({
            nome: modulo.nome,
            descricao: modulo.descricao,
            aulas: {
              create: modulo.aulas?.map((aula: any) => ({
                nome: aula.nome,
                descricao: aula.descricao,
                cargaHoraria: aula.cargaHoraria,
              })),
            },
          })),
        },
      },
      include: {
        modulos: {
          include: {
            aulas: true,
          },
        },
      },
    });

    return res.status(201).json(curso);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar curso' });
  }
});

// Atualizar curso
cursoRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, descricao, cargaHorariaTotal, preRequisitos, materialNecessario, modulos } = req.body;

    // Primeiro, excluir todos os módulos e aulas existentes
    await prisma.aula.deleteMany({
      where: {
        modulo: {
          cursoId: Number(id),
        },
      },
    });

    await prisma.modulo.deleteMany({
      where: {
        cursoId: Number(id),
      },
    });

    // Depois, atualizar o curso com os novos módulos e aulas
    const curso = await prisma.curso.update({
      where: { id: Number(id) },
      data: {
        nome,
        descricao,
        cargaHorariaTotal,
        preRequisitos,
        materialNecessario,
        modulos: {
          create: modulos?.map((modulo: any) => ({
            nome: modulo.nome,
            descricao: modulo.descricao,
            aulas: {
              create: modulo.aulas?.map((aula: any) => ({
                nome: aula.nome,
                descricao: aula.descricao,
                cargaHoraria: aula.cargaHoraria,
              })),
            },
          })),
        },
      },
      include: {
        modulos: {
          include: {
            aulas: true,
          },
        },
      },
    });

    return res.json(curso);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar curso' });
  }
});

// Excluir curso
cursoRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Primeiro, excluir todas as aulas
    await prisma.aula.deleteMany({
      where: {
        modulo: {
          cursoId: Number(id),
        },
      },
    });

    // Depois, excluir todos os módulos
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