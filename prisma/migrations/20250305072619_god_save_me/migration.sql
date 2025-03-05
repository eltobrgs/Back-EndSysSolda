/*
  Warnings:

  - The primary key for the `Aula` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dataInicio` on the `Aula` table. All the data in the column will be lost.
  - You are about to drop the column `dataTermino` on the `Aula` table. All the data in the column will be lost.
  - You are about to drop the column `siglaTecnica` on the `Aula` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Aula` table. All the data in the column will be lost.
  - The `id` column on the `Aula` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `password` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `senha` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AlunoModulo" DROP CONSTRAINT "AlunoModulo_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "AlunoModulo" DROP CONSTRAINT "AlunoModulo_moduloId_fkey";

-- DropForeignKey
ALTER TABLE "Aula" DROP CONSTRAINT "Aula_moduloId_fkey";

-- AlterTable
ALTER TABLE "AlunoModulo" ADD COLUMN     "dataInicio" TIMESTAMP(3),
ADD COLUMN     "dataTermino" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Aula" DROP CONSTRAINT "Aula_pkey",
DROP COLUMN "dataInicio",
DROP COLUMN "dataTermino",
DROP COLUMN "siglaTecnica",
DROP COLUMN "status",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Aula_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "password",
ADD COLUMN     "senha" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Aula" ADD CONSTRAINT "Aula_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlunoModulo" ADD CONSTRAINT "AlunoModulo_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlunoModulo" ADD CONSTRAINT "AlunoModulo_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
