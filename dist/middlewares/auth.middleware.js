"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    const token = authorization.replace('Bearer', '').trim();
    try {
        const data = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const { id, role } = data;
        req.userId = id;
        req.userRole = role;
        return next();
    }
    catch (_a) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};
exports.authMiddleware = authMiddleware;
