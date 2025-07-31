"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = createContext;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createContext() {
    return {
        prisma,
    };
}
//# sourceMappingURL=context.js.map