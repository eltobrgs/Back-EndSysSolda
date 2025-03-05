/*
  Warnings:

  - You are about to drop the `Aula` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Aula" DROP CONSTRAINT "Aula_moduloId_fkey";

-- DropTable
DROP TABLE "Aula";

-- CreateTable
CREATE TABLE "aulas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,
    "siglaTecnica" TEXT,
    "moduloId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aulas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "aulas" ADD CONSTRAINT "aulas_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
