/*
  Warnings:

  - You are about to drop the column `dataTermino` on the `AlunoModulo` table. All the data in the column will be lost.
  - You are about to drop the `Aluno` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `aulas` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cargaHorariaTotal` to the `Modulo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Aluno" DROP CONSTRAINT "Aluno_cursoId_fkey";

-- DropForeignKey
ALTER TABLE "AlunoModulo" DROP CONSTRAINT "AlunoModulo_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "Modulo" DROP CONSTRAINT "Modulo_cursoId_fkey";

-- DropForeignKey
ALTER TABLE "aulas" DROP CONSTRAINT "aulas_moduloId_fkey";

-- DropIndex
DROP INDEX "AlunoModulo_alunoId_moduloId_key";

-- AlterTable
ALTER TABLE "AlunoModulo" DROP COLUMN "dataTermino",
ADD COLUMN     "dataFim" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'pendente';

-- AlterTable
ALTER TABLE "Modulo" ADD COLUMN     "cargaHorariaTotal" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Aluno";

-- DropTable
DROP TABLE "aulas";

-- CreateTable
CREATE TABLE "alunos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "idade" INTEGER NOT NULL,
    "usaOculos" BOOLEAN NOT NULL DEFAULT false,
    "destroCanhoto" TEXT NOT NULL DEFAULT 'DESTRO',
    "cursoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alunos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Celula" (
    "id" SERIAL NOT NULL,
    "ordem" INTEGER NOT NULL,
    "siglaTecnica" TEXT NOT NULL,
    "moduloId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Celula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presenca" (
    "id" SERIAL NOT NULL,
    "alunoId" INTEGER NOT NULL,
    "celulaId" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "presente" BOOLEAN NOT NULL DEFAULT false,
    "horasFeitas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presenca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alunos_cpf_key" ON "alunos"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_email_key" ON "alunos"("email");

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modulo" ADD CONSTRAINT "Modulo_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Celula" ADD CONSTRAINT "Celula_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_celulaId_fkey" FOREIGN KEY ("celulaId") REFERENCES "Celula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlunoModulo" ADD CONSTRAINT "AlunoModulo_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
