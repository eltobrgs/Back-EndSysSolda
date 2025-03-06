import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth';
import { prisma } from '../lib/prisma';

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
    const cursoExiste = await prismaClient.curso.findUnique({
      where: { id: Number(cursoId) },
    });

    if (!cursoExiste) {
      return res.status(400).json({ error: 'Curso não encontrado' });
    }

    // Criar o aluno
    const aluno = await prismaClient.aluno.create({
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
        modulos.map(async (modulo: { moduloId: number; dataInicio: string | null; dataFim: string | null }) => {
          await prismaClient.alunoModulo.create({
            data: {
              alunoId: aluno.id,
              moduloId: Number(modulo.moduloId),
              status: 'PENDENTE',
              dataInicio: modulo.dataInicio ? new Date(modulo.dataInicio) : null,
              dataFim: modulo.dataFim ? new Date(modulo.dataFim) : null,
            },
          });
        })
      );
    }

    // Buscar o aluno com os relacionamentos
    const alunoCompleto = await prismaClient.aluno.findUnique({
      where: { id: aluno.id },
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
    const alunoExiste = await prismaClient.aluno.findUnique({
      where: { id: Number(id) },
    });

    if (!alunoExiste) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Verificar se o curso existe
    if (cursoId) {
      const cursoExiste = await prismaClient.curso.findUnique({
        where: { id: Number(cursoId) },
      });

      if (!cursoExiste) {
        return res.status(400).json({ error: 'Curso não encontrado' });
      }
    }

    // Atualizar o aluno
    const aluno = await prismaClient.aluno.update({
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
      await prismaClient.alunoModulo.deleteMany({
        where: { alunoId: Number(id) },
      });

      // Adicionar os módulos selecionados
      await Promise.all(
        modulos.map(async (modulo: { moduloId: number; dataInicio: string | null; dataFim: string | null }) => {
          await prismaClient.alunoModulo.create({
            data: {
              alunoId: aluno.id,
              moduloId: Number(modulo.moduloId),
              status: 'PENDENTE',
              dataInicio: modulo.dataInicio ? new Date(modulo.dataInicio) : null,
              dataFim: modulo.dataFim ? new Date(modulo.dataFim) : null,
            },
          });
        })
      );
    }

    // Buscar o aluno com os relacionamentos
    const alunoCompleto = await prismaClient.aluno.findUnique({
      where: { id: aluno.id },
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

// Atualizar progresso do aluno
alunoRouter.put('/:id/progresso', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { modulosStatus } = req.body;

    // Verificar se o aluno existe
    const alunoExiste = await prismaClient.aluno.findUnique({
      where: { id: Number(id) },
    });

    if (!alunoExiste) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Atualizar o status de cada módulo
    await Promise.all(
      modulosStatus.map(async (modulo: {
        moduloId: number;
        status: string;
        dataInicio: string | null;
        dataFim: string | null;
        celulasProgresso: {
          celulaId: number;
          presente: boolean;
          horasFeitas: number;
          data: string | null;
        }[];
      }) => {
        // Atualizar o status do módulo
        await prismaClient.alunoModulo.upsert({
          where: {
            alunoId_moduloId: {
              alunoId: Number(id),
              moduloId: modulo.moduloId,
            },
          },
          update: {
            status: modulo.status,
            dataInicio: modulo.dataInicio ? new Date(modulo.dataInicio) : null,
            dataFim: modulo.dataFim ? new Date(modulo.dataFim) : null,
          },
          create: {
            alunoId: Number(id),
            moduloId: modulo.moduloId,
            status: modulo.status,
            dataInicio: modulo.dataInicio ? new Date(modulo.dataInicio) : null,
            dataFim: modulo.dataFim ? new Date(modulo.dataFim) : null,
          },
        });

        // Atualizar as presenças das células
        if (modulo.celulasProgresso && modulo.celulasProgresso.length > 0) {
          await Promise.all(
            modulo.celulasProgresso.map(async (celula) => {
              await prismaClient.presenca.upsert({
                where: {
                  alunoId_celulaId: {
                    alunoId: Number(id),
                    celulaId: celula.celulaId,
                  },
                },
                update: {
                  presente: celula.presente,
                  horasFeitas: celula.horasFeitas,
                  data: celula.data ? new Date(celula.data) : new Date(),
                },
                create: {
                  alunoId: Number(id),
                  celulaId: celula.celulaId,
                  presente: celula.presente,
                  horasFeitas: celula.horasFeitas,
                  data: celula.data ? new Date(celula.data) : new Date(),
                },
              });
            })
          );
        }
      })
    );

    // Buscar o aluno atualizado com os relacionamentos
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
        alunoModulos: {
          include: {
            modulo: true,
          },
        },
      },
    });

    return res.json(alunoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
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
          celulaId: celula.id,
          presente: presenca?.presente ?? null,
          horasFeitas: presenca?.horasFeitas ?? 0,
          data: presenca?.data || null,
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
    const { celulaId, presente, horasFeitas, data } = req.body;

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
        data: data ? new Date(data) : new Date(),
      },
      create: {
        alunoId: Number(id),
        celulaId: Number(celulaId),
        presente,
        horasFeitas,
        data: data ? new Date(data) : new Date(),
      },
    });

    return res.json(presenca);
  } catch (error) {
    console.error('Erro ao registrar presença:', error);
    return res.status(500).json({ error: 'Erro ao registrar presença' });
  }
});

export default alunoRouter; 