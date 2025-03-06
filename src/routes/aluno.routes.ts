import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const prismaClient = new PrismaClient();
const alunoRouter = Router();

alunoRouter.use(authMiddleware);

// Listar todos os alunos
alunoRouter.get('/', async (req: Request, res: Response) => {
  try {
    const alunos = await prismaClient.aluno.findMany({
      include: {
        curso: {
          include: {
            modulos: {
              include: {
                celulas: true,
              },
            },
          },
        },
        alunoModulos: true,
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
    const aluno = await prismaClient.aluno.findUnique({
      where: { id: Number(id) },
      include: {
        curso: {
          include: {
            modulos: {
              include: {
                celulas: true,
              },
            },
          },
        },
        alunoModulos: true,
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

const createAlunoSchema = z.object({
  nome: z.string(),
  cpf: z.string(),
  email: z.string().email(),
  telefone: z.string(),
  idade: z.number(),
  usaOculos: z.boolean(),
  destroCanhoto: z.enum(['DESTRO', 'CANHOTO']),
  cursoId: z.number(),
  modulos: z.array(z.object({
    moduloId: z.number(),
    status: z.string(),
    dataInicio: z.string().nullable(),
    dataFim: z.string().nullable()
  }))
});

// Tipos
type ModuloData = {
  moduloId: number;
  status: string;
  dataInicio: string | null;
  dataFim: string | null;
};

type CelulaProgresso = {
  celulaId: number;
  presente: boolean;
  horasFeitas: number;
  data: string;
};

type ModuloStatus = {
  moduloId: number;
  status: string;
  dataInicio: string | null;
  dataFim: string | null;
  celulasProgresso: CelulaProgresso[];
};

// Criar aluno
alunoRouter.post('/', async (req: Request, res: Response) => {
  try {
    const data = createAlunoSchema.parse(req.body);
    const { modulos, ...alunoData } = data;

    const aluno = await prisma.aluno.create({
      data: {
        ...alunoData,
        alunoModulos: {
          create: modulos.map((modulo: ModuloData) => ({
            moduloId: modulo.moduloId,
            status: modulo.status,
            dataInicio: modulo.dataInicio ? new Date(modulo.dataInicio) : null,
            dataFim: modulo.dataFim ? new Date(modulo.dataFim) : null
          }))
        }
      },
      include: {
        curso: {
          include: {
            modulos: {
              include: {
                celulas: true
              }
            }
          }
        },
        alunoModulos: true
      }
    });

    return res.status(201).json(aluno);
  } catch (err: unknown) {
    console.error('Erro ao criar aluno:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao criar aluno' });
  }
});

const updateAlunoSchema = createAlunoSchema;

// Atualizar aluno
alunoRouter.put('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateAlunoSchema.parse(req.body);
    const { modulos, ...alunoData } = data;

    // Verificar se o aluno existe
    const alunoExiste = await prismaClient.aluno.findUnique({
      where: { id: Number(id) },
    });

    if (!alunoExiste) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Verificar se o curso existe
    if (alunoData.cursoId) {
      const cursoExiste = await prismaClient.curso.findUnique({
        where: { id: Number(alunoData.cursoId) },
      });

      if (!cursoExiste) {
        return res.status(400).json({ error: 'Curso não encontrado' });
      }
    }

    // Primeiro, exclui todos os módulos existentes
    await prismaClient.alunoModulo.deleteMany({
      where: { alunoId: Number(id) }
    });

    // Depois, atualiza o aluno e cria os novos módulos
    const aluno = await prismaClient.aluno.update({
      where: { id: Number(id) },
      data: {
        ...alunoData,
        alunoModulos: {
          create: modulos.map((modulo: ModuloData) => ({
            moduloId: modulo.moduloId,
            status: modulo.status,
            dataInicio: modulo.dataInicio ? new Date(modulo.dataInicio) : null,
            dataFim: modulo.dataFim ? new Date(modulo.dataFim) : null
          }))
        }
      },
      include: {
        curso: {
          include: {
            modulos: {
              include: {
                celulas: true,
              },
            },
          },
        },
        alunoModulos: true,
      },
    });

    return res.json(aluno);
  } catch (err: unknown) {
    console.error('Erro ao atualizar aluno:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
});

// Excluir aluno
alunoRouter.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se o aluno existe
    const alunoExiste = await prismaClient.aluno.findUnique({
      where: { id: Number(id) },
    });

    if (!alunoExiste) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Excluir o aluno
    await prismaClient.aluno.delete({
      where: { id: Number(id) },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    return res.status(500).json({ error: 'Erro ao excluir aluno' });
  }
});

const updateProgressoSchema = z.object({
  modulosStatus: z.array(z.object({
    moduloId: z.number(),
    status: z.string(),
    dataInicio: z.string().nullable(),
    dataFim: z.string().nullable(),
    celulasProgresso: z.array(z.object({
      celulaId: z.number(),
      presente: z.boolean(),
      horasFeitas: z.number(),
      data: z.string()
    }))
  }))
});

// Atualizar progresso do aluno
alunoRouter.put('/:id/progresso', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateProgressoSchema.parse(req.body);

    // Atualiza cada módulo e suas presenças
    await Promise.all(
      data.modulosStatus.map(async (moduloStatus: ModuloStatus) => {
        // Atualiza o status do módulo
        await prismaClient.alunoModulo.upsert({
          where: {
            alunoId_moduloId: {
              alunoId: Number(id),
              moduloId: moduloStatus.moduloId
            }
          },
          update: {
            status: moduloStatus.status,
            dataInicio: moduloStatus.dataInicio ? new Date(moduloStatus.dataInicio) : null,
            dataFim: moduloStatus.dataFim ? new Date(moduloStatus.dataFim) : null
          },
          create: {
            alunoId: Number(id),
            moduloId: moduloStatus.moduloId,
            status: moduloStatus.status,
            dataInicio: moduloStatus.dataInicio ? new Date(moduloStatus.dataInicio) : null,
            dataFim: moduloStatus.dataFim ? new Date(moduloStatus.dataFim) : null
          }
        });

        // Atualiza as presenças das células
        await Promise.all(
          moduloStatus.celulasProgresso.map(async (celulaProgresso: CelulaProgresso) => {
            await prismaClient.presenca.upsert({
              where: {
                alunoId_celulaId: {
                  alunoId: Number(id),
                  celulaId: celulaProgresso.celulaId
                }
              },
              update: {
                presente: celulaProgresso.presente,
                horasFeitas: celulaProgresso.horasFeitas,
                data: new Date(celulaProgresso.data)
              },
              create: {
                alunoId: Number(id),
                celulaId: celulaProgresso.celulaId,
                presente: celulaProgresso.presente,
                horasFeitas: celulaProgresso.horasFeitas,
                data: new Date(celulaProgresso.data)
              }
            });
          })
        );
      })
    );

    // Retorna o aluno atualizado com todas as informações
    const alunoAtualizado = await prismaClient.aluno.findUnique({
      where: { id: Number(id) },
      include: {
        curso: {
          include: {
            modulos: {
              include: {
                celulas: true,
              },
            },
          },
        },
        alunoModulos: true,
      },
    });

    return res.json(alunoAtualizado);
  } catch (err: unknown) {
    console.error('Erro ao atualizar progresso:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro ao atualizar progresso' });
  }
});

// Buscar presenças do aluno em um módulo
alunoRouter.get('/:alunoId/modulos/:moduloId/presencas', async (req: Request<{ alunoId: string; moduloId: string }>, res: Response) => {
  try {
    const { alunoId, moduloId } = req.params;

    const modulo = await prismaClient.modulo.findUnique({
      where: { id: Number(moduloId) },
      include: {
        celulas: true,
      },
    });

    if (!modulo) {
      return res.status(404).json({ error: 'Módulo não encontrado' });
    }

    const presencas = await Promise.all(
      modulo.celulas.map(async (celula) => {
        const presenca = await prismaClient.presenca.findUnique({
          where: {
            alunoId_celulaId: {
              alunoId: Number(alunoId),
              celulaId: celula.id,
            },
          },
        });

        return {
          id: presenca?.id || 0,
          alunoId: Number(alunoId),
          celulaId: celula.id,
          data: presenca?.data || null,
          presente: presenca?.presente ?? null,
          horasFeitas: presenca?.horasFeitas || 0
        };
      })
    );

    return res.json(presencas);
  } catch (error) {
    console.error('Erro ao buscar presenças:', error);
    return res.status(500).json({ error: 'Erro ao buscar presenças' });
  }
});

// Registrar presença
alunoRouter.post('/:id/presencas', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { celulaId, presente, horasFeitas } = req.body;

    const presenca = await prismaClient.presenca.upsert({
      where: {
        alunoId_celulaId: {
          alunoId: Number(id),
          celulaId: Number(celulaId),
        },
      },
      update: {
        presente,
        horasFeitas,
        data: new Date()
      },
      create: {
        alunoId: Number(id),
        celulaId: Number(celulaId),
        presente,
        horasFeitas,
        data: new Date()
      }
    });

    return res.json(presenca);
  } catch (error) {
    console.error('Erro ao registrar presença:', error);
    return res.status(500).json({ error: 'Erro ao registrar presença' });
  }
});

export default alunoRouter; 