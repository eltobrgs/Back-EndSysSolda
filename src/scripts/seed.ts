import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Limpar o banco de dados
    console.log('Limpando banco de dados...');
    await prisma.presenca.deleteMany();
    await prisma.alunoModulo.deleteMany();
    await prisma.celula.deleteMany();
    await prisma.modulo.deleteMany();
    await prisma.aluno.deleteMany();
    await prisma.curso.deleteMany();
    await prisma.usuario.deleteMany();

    // Criar usuário admin
    console.log('Criando usuário administrador...');
    const adminUser = await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        email: 'admin@syssolda.com',
        senha: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
      },
    });
    console.log('Usuário admin criado:', adminUser.email);

    // Criar cursos
    console.log('Criando cursos...');
    const cursoPrincipal = await prisma.curso.create({
      data: {
        nome: 'Soldagem Industrial Avançada',
        descricao: 'Curso completo de soldagem industrial com práticas avançadas',
        cargaHorariaTotal: 120,
        preRequisitos: 'Idade mínima de 18 anos, Ensino Médio Completo',
        materialNecessario: 'EPI completo, material será fornecido pelo curso',
        modulos: {
          create: [
            {
              nome: 'Fundamentos de Soldagem',
              descricao: 'Introdução aos conceitos básicos e segurança',
              cargaHorariaTotal: 40,
              celulas: {
                create: [
                  { ordem: 1, siglaTecnica: 'FUN-1' },
                  { ordem: 2, siglaTecnica: 'FUN-2' },
                  { ordem: 3, siglaTecnica: 'FUN-3' },
                  { ordem: 4, siglaTecnica: 'FUN-4' },
                ],
              },
            },
            {
              nome: 'Soldagem MIG/MAG',
              descricao: 'Técnicas de soldagem com processos MIG/MAG',
              cargaHorariaTotal: 40,
              celulas: {
                create: [
                  { ordem: 1, siglaTecnica: 'MIG-1' },
                  { ordem: 2, siglaTecnica: 'MIG-2' },
                  { ordem: 3, siglaTecnica: 'MIG-3' },
                  { ordem: 4, siglaTecnica: 'MIG-4' },
                ],
              },
            },
            {
              nome: 'Soldagem TIG',
              descricao: 'Técnicas avançadas de soldagem TIG',
              cargaHorariaTotal: 40,
              celulas: {
                create: [
                  { ordem: 1, siglaTecnica: 'TIG-1' },
                  { ordem: 2, siglaTecnica: 'TIG-2' },
                  { ordem: 3, siglaTecnica: 'TIG-3' },
                  { ordem: 4, siglaTecnica: 'TIG-4' },
                ],
              },
            },
          ],
        },
      },
      include: {
        modulos: {
          include: {
            celulas: true,
          },
        },
      },
    });

    const cursoBasico = await prisma.curso.create({
      data: {
        nome: 'Introdução à Soldagem',
        descricao: 'Curso básico para iniciantes em soldagem',
        cargaHorariaTotal: 60,
        preRequisitos: 'Idade mínima de 16 anos',
        materialNecessario: 'EPI básico, material será fornecido pelo curso',
        modulos: {
          create: [
            {
              nome: 'Segurança na Soldagem',
              descricao: 'Fundamentos de segurança e EPIs',
              cargaHorariaTotal: 20,
              celulas: {
                create: [
                  { ordem: 1, siglaTecnica: 'SEG-1' },
                  { ordem: 2, siglaTecnica: 'SEG-2' },
                ],
              },
            },
            {
              nome: 'Soldagem Básica',
              descricao: 'Introdução às técnicas básicas',
              cargaHorariaTotal: 40,
              celulas: {
                create: [
                  { ordem: 1, siglaTecnica: 'BAS-1' },
                  { ordem: 2, siglaTecnica: 'BAS-2' },
                  { ordem: 3, siglaTecnica: 'BAS-3' },
                ],
              },
            },
          ],
        },
      },
      include: {
        modulos: {
          include: {
            celulas: true,
          },
        },
      },
    });

    console.log('Cursos criados com sucesso!');

    // Criar alunos
    console.log('Criando alunos...');
    const alunos = await Promise.all([
      prisma.aluno.create({
        data: {
          nome: 'João Silva',
          cpf: '123.456.789-00',
          email: 'joao.silva@email.com',
          telefone: '(11) 98765-4321',
          idade: 25,
          usaOculos: true,
          destroCanhoto: 'DESTRO',
          cursoId: cursoPrincipal.id,
          alunoModulos: {
            create: cursoPrincipal.modulos.map((modulo) => ({
              moduloId: modulo.id,
              status: 'PENDENTE',
              dataInicio: new Date(),
            })),
          },
        },
      }),
      prisma.aluno.create({
        data: {
          nome: 'Maria Santos',
          cpf: '987.654.321-00',
          email: 'maria.santos@email.com',
          telefone: '(11) 91234-5678',
          idade: 22,
          usaOculos: false,
          destroCanhoto: 'CANHOTO',
          cursoId: cursoBasico.id,
          alunoModulos: {
            create: cursoBasico.modulos.map((modulo) => ({
              moduloId: modulo.id,
              status: 'PENDENTE',
              dataInicio: new Date(),
            })),
          },
        },
      }),
      prisma.aluno.create({
        data: {
          nome: 'Pedro Oliveira',
          cpf: '456.789.123-00',
          email: 'pedro.oliveira@email.com',
          telefone: '(11) 94567-8901',
          idade: 30,
          usaOculos: true,
          destroCanhoto: 'DESTRO',
          cursoId: cursoPrincipal.id,
          alunoModulos: {
            create: cursoPrincipal.modulos.map((modulo) => ({
              moduloId: modulo.id,
              status: 'PENDENTE',
              dataInicio: new Date(),
            })),
          },
        },
      }),
    ]);

    console.log('Alunos criados com sucesso!');

    // Criar algumas presenças de exemplo
    console.log('Criando registros de presença...');
    
    // Para o primeiro aluno
    const primeiroModulo = cursoPrincipal.modulos[0];
    await Promise.all(
      primeiroModulo.celulas.map(async (celula, index) => {
        await prisma.presenca.create({
          data: {
            alunoId: alunos[0].id,
            celulaId: celula.id,
            presente: index < 2 ? true : null, // Primeiras duas células com presença, resto não registrado
            horasFeitas: index < 2 ? 4 : 0,
            data: index < 2 ? new Date() : null,
          },
        });
      })
    );

    // Para o segundo aluno
    const moduloBasico = cursoBasico.modulos[0];
    await Promise.all(
      moduloBasico.celulas.map(async (celula, index) => {
        await prisma.presenca.create({
          data: {
            alunoId: alunos[1].id,
            celulaId: celula.id,
            presente: index === 0 ? true : null, // Primeira célula com presença, resto não registrado
            horasFeitas: index === 0 ? 4 : 0,
            data: index === 0 ? new Date() : null,
          },
        });
      })
    );

    console.log('Registros de presença criados com sucesso!');
    console.log('Seed concluído com sucesso!');

  } catch (error) {
    console.error('Erro durante o seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
