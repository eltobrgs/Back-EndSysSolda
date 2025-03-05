import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth';

const prisma = new PrismaClient();
const alunoRouter = Router();

alunoRouter.use(authMiddleware);

// Listar todos os alunos
alunoRouter.get('/', async (req: Request, res: Response) => {
  try {
    const alunos = await prisma.aluno.findMany({
      include: {
        curso: {
          include: {
            modulos: {
              include: {
                aulas: true,
              },
            },
          },
        },
        alunoModulos: {
          include: {
            modulo: true,
          },
        },
      },
    });
    return res.json(alunos);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    return res.status(500).json({ error: 'Erro ao listar alunos' });
  }
});

// Buscar aluno por ID
alunoRouter.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const aluno = await prisma.aluno.findUnique({
      where: { id: Number(id) },
      include: {
        curso: {
          include: {
            modulos: {
              include: {
                aulas: true,
              },
            },
          },
        },
        alunoModulos: {
          include: {
            modulo: true,
          },
        },
      },
    });

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    return res.json(aluno);
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    return res.status(500).json({ error: 'Erro ao buscar aluno' });
  }
});

// Criar aluno
alunoRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      nome,
      cpf,
      email,
      telefone,
      idade,
      usaOculos,
      destroCanhoto,
      cursoId,
      modulos,
    } = req.body;

    // Verificar se o curso existe
    const cursoExiste = await prisma.curso.findUnique({
      where: { id: Number(cursoId) },
    });

    if (!cursoExiste) {
      return res.status(400).json({ error: 'Curso não encontrado' });
    }

    // Criar o aluno
    const aluno = await prisma.aluno.create({
      data: {
        nome,
        cpf,
        email,
        telefone,
        idade: Number(idade),
        usaOculos: Boolean(usaOculos),
        destroCanhoto,
        cursoId: Number(cursoId),
      },
    });

    // Adicionar os módulos selecionados
    if (modulos && modulos.length > 0) {
      await Promise.all(
        modulos.map(async (modulo: { moduloId: number; dataInicio: string | null; dataTermino: string | null }) => {
          await prisma.alunoModulo.create({
            data: {
              alunoId: aluno.id,
              moduloId: Number(modulo.moduloId),
              status: 'PENDENTE',
              dataInicio: modulo.dataInicio ? new Date(modulo.dataInicio) : null,
              dataTermino: modulo.dataTermino ? new Date(modulo.dataTermino) : null,
            },
          });
        })
      );
    }

    // Buscar o aluno com os relacionamentos
    const alunoCompleto = await prisma.aluno.findUnique({
      where: { id: aluno.id },
      include: {
        curso: {
          include: {
            modulos: {
              include: {
                aulas: true,
              },
            },
          },
        },
        alunoModulos: {
          include: {
            modulo: true,
          },
        },
      },
    });

    return res.status(201).json(alunoCompleto);
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    return res.status(500).json({ error: 'Erro ao criar aluno' });
  }
});

// Atualizar aluno
alunoRouter.put('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nome,
      cpf,
      email,
      telefone,
      idade,
      usaOculos,
      destroCanhoto,
      cursoId,
      modulos,
    } = req.body;

    // Verificar se o aluno existe
    const alunoExiste = await prisma.aluno.findUnique({
      where: { id: Number(id) },
    });

    if (!alunoExiste) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Verificar se o curso existe
    if (cursoId) {
      const cursoExiste = await prisma.curso.findUnique({
        where: { id: Number(cursoId) },
      });

      if (!cursoExiste) {
        return res.status(400).json({ error: 'Curso não encontrado' });
      }
    }

    // Atualizar o aluno
    const aluno = await prisma.aluno.update({
      where: { id: Number(id) },
      data: {
        nome,
        cpf,
        email,
        telefone,
        idade: Number(idade),
        usaOculos: Boolean(usaOculos),
        destroCanhoto,
        cursoId: cursoId ? Number(cursoId) : undefined,
      },
    });

    // Atualizar os módulos
    if (modulos && modulos.length > 0) {
      // Remover todos os módulos atuais
      await prisma.alunoModulo.deleteMany({
        where: { alunoId: Number(id) },
      });

      // Adicionar os módulos selecionados
      await Promise.all(
        modulos.map(async (modulo: { moduloId: number; dataInicio: string | null; dataTermino: string | null }) => {
          await prisma.alunoModulo.create({
            data: {
              alunoId: aluno.id,
              moduloId: Number(modulo.moduloId),
              status: 'PENDENTE',
              dataInicio: modulo.dataInicio ? new Date(modulo.dataInicio) : null,
              dataTermino: modulo.dataTermino ? new Date(modulo.dataTermino) : null,
            },
          });
        })
      );
    }

    // Buscar o aluno com os relacionamentos
    const alunoCompleto = await prisma.aluno.findUnique({
      where: { id: aluno.id },
      include: {
        curso: {
          include: {
            modulos: {
              include: {
                aulas: true,
              },
            },
          },
        },
        alunoModulos: {
          include: {
            modulo: true,
          },
        },
      },
    });

    return res.json(alunoCompleto);
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    return res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
});

// Excluir aluno
alunoRouter.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se o aluno existe
    const alunoExiste = await prisma.aluno.findUnique({
      where: { id: Number(id) },
    });

    if (!alunoExiste) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Excluir o aluno (as relações serão excluídas automaticamente devido ao onDelete: Cascade)
    await prisma.aluno.delete({
      where: { id: Number(id) },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    return res.status(500).json({ error: 'Erro ao excluir aluno' });
  }
});

// Atualizar progresso do aluno
alunoRouter.put('/:id/progresso', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { modulosStatus } = req.body;

    // Verificar se o aluno existe
    const alunoExiste = await prisma.aluno.findUnique({
      where: { id: Number(id) },
    });

    if (!alunoExiste) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Atualizar o status dos módulos
    if (modulosStatus && modulosStatus.length > 0) {
      await Promise.all(
        modulosStatus.map(async (modulo: { 
          moduloId: number; 
          status: string;
          dataInicio: string | null;
          dataTermino: string | null;
        }) => {
          await prisma.alunoModulo.updateMany({
            where: {
              alunoId: Number(id),
              moduloId: Number(modulo.moduloId),
            },
            data: {
              status: modulo.status,
              dataInicio: modulo.dataInicio ? new Date(modulo.dataInicio) : null,
              dataTermino: modulo.dataTermino ? new Date(modulo.dataTermino) : null,
            },
          });
        })
      );
    }

    // Buscar o aluno com os relacionamentos
    const alunoCompleto = await prisma.aluno.findUnique({
      where: { id: Number(id) },
      include: {
        curso: {
          include: {
            modulos: {
              include: {
                aulas: true,
              },
            },
          },
        },
        alunoModulos: {
          include: {
            modulo: true,
          },
        },
      },
    });

    return res.json(alunoCompleto);
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    return res.status(500).json({ error: 'Erro ao atualizar progresso' });
  }
});

export default alunoRouter; 