"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("../server");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const usuario = await server_1.prisma.usuario.findUnique({
            where: { email }
        });
        if (!usuario) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        const senhaValida = await bcryptjs_1.default.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: 'Senha inválida' });
        }
        const token = jsonwebtoken_1.default.sign({ id: usuario.id, role: usuario.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({
            usuario: {
                id: usuario.id,
                email: usuario.email,
                nome: usuario.nome,
                role: usuario.role
            },
            token
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha, role } = req.body;
        const usuarioExiste = await server_1.prisma.usuario.findUnique({
            where: { email }
        });
        if (usuarioExiste) {
            return res.status(400).json({ error: 'Usuário já existe' });
        }
        const hashSenha = await bcryptjs_1.default.hash(senha, 10);
        const usuario = await server_1.prisma.usuario.create({
            data: {
                nome,
                email,
                senha: hashSenha,
                role: role || 'INSTRUTOR'
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: usuario.id, role: usuario.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.status(201).json({
            usuario: {
                id: usuario.id,
                email: usuario.email,
                nome: usuario.nome,
                role: usuario.role
            },
            token
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.default = router;
