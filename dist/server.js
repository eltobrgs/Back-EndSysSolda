"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
// Rotas
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const aluno_routes_1 = __importDefault(require("./routes/aluno.routes"));
const curso_routes_1 = __importDefault(require("./routes/curso.routes"));
const modulo_routes_1 = __importDefault(require("./routes/modulo.routes"));
const aula_routes_1 = __importDefault(require("./routes/aula.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rotas
app.use('/api/auth', auth_routes_1.default);
app.use('/api/alunos', aluno_routes_1.default);
app.use('/api/cursos', curso_routes_1.default);
app.use('/api/modulos', modulo_routes_1.default);
app.use('/api/aulas', aula_routes_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
