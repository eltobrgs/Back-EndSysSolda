"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("../server");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Listar todas as aulas
router.get('/', async (req, res) => {
    try {
        const aulas = await server_1.prisma.aula.findMany({
            include: {
                modulo: {
                    include: {
                        curso: true
                    }
                }
            }
        });
        return res.json(aulas);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Buscar aula por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const aula = await server_1.prisma.aula.findUnique({
            where: { id: Number(id) },
            include: {
                modulo: {
                    include: {
                        curso: true
                    }
                }
            }
        });
        if (!aula) {
            return res.status(404).json({ error: 'Aula não encontrada' });
        }
        return res.json(aula);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Listar aulas por módulo
router.get('/modulo/:moduloId', async (req, res) => {
    try {
        const { moduloId } = req.params;
        const aulas = await server_1.prisma.aula.findMany({
            where: { moduloId: Number(moduloId) },
            include: {
                modulo: {
                    include: {
                        curso: true
                    }
                }
            }
        });
        return res.json(aulas);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Atualizar aula
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, cargaHoraria, siglaTecnica } = req.body;
        const aula = await server_1.prisma.aula.update({
            where: { id: Number(id) },
            data: {
                nome,
                descricao,
                cargaHoraria,
                siglaTecnica
            },
            include: {
                modulo: {
                    include: {
                        curso: true
                    }
                }
            }
        });
        return res.json(aula);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.default = router;
