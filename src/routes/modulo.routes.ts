import { Router } from 'express';
import { prisma } from '../server';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Listar todos os módulos
router.get('/', async (req, res) => {
  try {
    const modulos = await prisma.modulo.findMany({
      include: {
        curso: true,
        aulas: true,
        alunoModulos: {
          include: {
            aluno: true
          }
        }
      }
    });

    return res.json(modulos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar módulo por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const modulo = await prisma.modulo.findUnique({
      where: { id: Number(id) },
      include: {
        curso: true,
        aulas: true,
        alunoModulos: {
          include: {
            aluno: true
          }
        }
      }
    });

    if (!modulo) {
      return res.status(404).json({ error: 'Módulo não encontrado' });
    }

    return res.json(modulo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Habilitar/Desabilitar módulo para aluno
router.put('/:id/habilitar', async (req, res) => {
  try {
    const { id } = req.params;
    const { alunoId, status } = req.body;

    const alunoModulo = await prisma.alunoModulo.upsert({
      where: {
        alunoId_moduloId: {
          alunoId: Number(alunoId),
          moduloId: Number(id)
        }
      },
      update: {
        status
      },
      create: {
        alunoId: Number(alunoId),
        moduloId: Number(id),
        status
      },
      include: {
        aluno: true,
        modulo: true
      }
    });

    return res.json(alunoModulo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar conclusão do módulo
router.put('/:id/concluir', async (req, res) => {
  try {
    const { id } = req.params;
    const { alunoId, dataTermino } = req.body;

    const alunoModulo = await prisma.alunoModulo.update({
      where: {
        alunoId_moduloId: {
          alunoId: Number(alunoId),
          moduloId: Number(id)
        }
      },
      data: {
        dataTermino: dataTermino ? new Date(dataTermino) : null,
        status: dataTermino ? 'CONCLUIDO' : 'PENDENTE'
      },
      include: {
        aluno: true,
        modulo: true
      }
    });

    return res.json(alunoModulo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 