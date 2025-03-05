"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("../server");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Listar todos os módulos
router.get('/', async (req, res) => {
    try {
        const modulos = await server_1.prisma.modulo.findMany({
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Buscar módulo por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const modulo = await server_1.prisma.modulo.findUnique({
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Habilitar/Desabilitar módulo para aluno
router.put('/:id/habilitar', async (req, res) => {
    try {
        const { id } = req.params;
        const { alunoId, status } = req.body;
        const alunoModulo = await server_1.prisma.alunoModulo.upsert({
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Atualizar conclusão do módulo
router.put('/:id/concluir', async (req, res) => {
    try {
        const { id } = req.params;
        const { alunoId, dataTermino } = req.body;
        const alunoModulo = await server_1.prisma.alunoModulo.update({
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.default = router;
