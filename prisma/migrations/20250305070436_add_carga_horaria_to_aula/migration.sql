/*
  Warnings:

  - The primary key for the `Aula` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `siglaTecnica` to the `Aula` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Aula" DROP CONSTRAINT "Aula_moduloId_fkey";

-- AlterTable
ALTER TABLE "Aula" DROP CONSTRAINT "Aula_pkey",
ADD COLUMN     "dataInicio" TIMESTAMP(3),
ADD COLUMN     "dataTermino" TIMESTAMP(3),
ADD COLUMN     "siglaTecnica" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDENTE',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Aula_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Aula_id_seq";

-- AddForeignKey
ALTER TABLE "Aula" ADD CONSTRAINT "Aula_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
