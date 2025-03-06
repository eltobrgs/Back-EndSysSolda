import { Router } from 'express';
import { prisma } from '../server';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Listar todas as células
router.get('/', async (req, res) => {
  try {
    const celulas = await prisma.celula.findMany({
      include: {
        modulo: true,
        presencas: {
          include: {
            aluno: true
          }
        }
      }
    });

    return res.json(celulas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar célula por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const celula = await prisma.celula.findUnique({
      where: { id: Number(id) },
      include: {
        modulo: true,
        presencas: {
          include: {
            aluno: true
          }
        }
      }
    });

    if (!celula) {
      return res.status(404).json({ error: 'Célula não encontrada' });
    }

    return res.json(celula);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar presenças de uma célula
router.get('/:id/presencas', async (req, res) => {
  try {
    const { id } = req.params;
    const presencas = await prisma.presenca.findMany({
      where: { celulaId: Number(id) },
      include: {
        aluno: true
      }
    });

    return res.json(presencas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registrar presença em uma célula
router.post('/:id/presencas', async (req, res) => {
  try {
    const { id } = req.params;
    const { alunoId, presente, horasFeitas } = req.body;

    const presenca = await prisma.presenca.upsert({
      where: {
        alunoId_celulaId: {
          alunoId: Number(alunoId),
          celulaId: Number(id)
        }
      },
      update: {
        presente,
        horasFeitas,
        data: new Date()
      },
      create: {
        alunoId: Number(alunoId),
        celulaId: Number(id),
        presente,
        horasFeitas,
        data: new Date()
      }
    });

    return res.json(presenca);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 