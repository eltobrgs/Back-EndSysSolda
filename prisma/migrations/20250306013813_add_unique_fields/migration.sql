/*
  Warnings:

  - A unique constraint covering the columns `[alunoId,moduloId]` on the table `AlunoModulo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[alunoId,celulaId]` on the table `Presenca` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AlunoModulo_alunoId_moduloId_key" ON "AlunoModulo"("alunoId", "moduloId");

-- CreateIndex
CREATE UNIQUE INDEX "Presenca_alunoId_celulaId_key" ON "Presenca"("alunoId", "celulaId");
