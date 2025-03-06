import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🗑️ Limpando banco de dados...');
    
    // Limpar dados existentes
    await prisma.presenca.deleteMany();
    await prisma.celula.deleteMany();
    await prisma.alunoModulo.deleteMany();
    await prisma.modulo.deleteMany();
    await prisma.aluno.deleteMany();
    await prisma.curso.deleteMany();
    await prisma.usuario.deleteMany();

    console.log('👤 Criando usuário administrador...');
    
    // Criar usuário administrador
    const admin = await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        email: 'admin@syssolda.com',
        senha: await hash('admin123', 8),
        role: 'ADMIN'
      }
    });

    console.log('📚 Criando cursos...');
    
    // Criar curso de Soldagem Industrial Avançada
    const cursoAvancado = await prisma.curso.create({
      data: {
        nome: 'Soldagem Industrial Avançada',
        descricao: 'Curso avançado de soldagem industrial com foco em técnicas especializadas',
        cargaHorariaTotal: 120,
        preRequisitos: 'Conhecimento básico em soldagem',
        materialNecessario: 'EPI completo, eletrodos e materiais específicos',
        modulos: {
          create: [
            {
              nome: 'Soldagem MIG/MAG',
              descricao: 'Técnicas avançadas de soldagem MIG/MAG',
              cargaHorariaTotal: 40,
              celulas: {
                create: [
                  { ordem: 1, siglaTecnica: 'MIG1' },
                  { ordem: 2, siglaTecnica: 'MIG2' },
                  { ordem: 3, siglaTecnica: 'MIG3' },
                  { ordem: 4, siglaTecnica: 'MIG4' }
                ]
              }
            },
            {
              nome: 'Soldagem TIG',
              descricao: 'Técnicas avançadas de soldagem TIG',
              cargaHorariaTotal: 40,
              celulas: {
                create: [
                  { ordem: 1, siglaTecnica: 'TIG1' },
                  { ordem: 2, siglaTecnica: 'TIG2' },
                  { ordem: 3, siglaTecnica: 'TIG3' },
                  { ordem: 4, siglaTecnica: 'TIG4' }
                ]
              }
            },
            {
              nome: 'Soldagem Especial',
              descricao: 'Técnicas especiais de soldagem',
              cargaHorariaTotal: 40,
              celulas: {
                create: [
                  { ordem: 1, siglaTecnica: 'ESP1' },
                  { ordem: 2, siglaTecnica: 'ESP2' },
                  { ordem: 3, siglaTecnica: 'ESP3' },
                  { ordem: 4, siglaTecnica: 'ESP4' }
                ]
              }
            }
          ]
        }
      },
      include: {
        modulos: {
          include: {
            celulas: true
          }
        }
      }
    });

    // Criar curso de Introdução à Soldagem
    const cursoBasico = await prisma.curso.create({
      data: {
        nome: 'Introdução à Soldagem',
        descricao: 'Curso básico de soldagem para iniciantes',
        cargaHorariaTotal: 60,
        preRequisitos: 'Nenhum',
        materialNecessario: 'EPI básico',
        modulos: {
          create: [
            {
              nome: 'Fundamentos da Soldagem',
              descricao: 'Conceitos básicos e segurança',
              cargaHorariaTotal: 30,
              celulas: {
                create: [
                  { ordem: 1, siglaTecnica: 'FUN1' },
                  { ordem: 2, siglaTecnica: 'FUN2' },
                  { ordem: 3, siglaTecnica: 'FUN3' }
                ]
              }
            },
            {
              nome: 'Práticas Básicas',
              descricao: 'Práticas iniciais de soldagem',
              cargaHorariaTotal: 30,
              celulas: {
                create: [
                  { ordem: 1, siglaTecnica: 'PRA1' },
                  { ordem: 2, siglaTecnica: 'PRA2' }
                ]
              }
            }
          ]
        }
      },
      include: {
        modulos: {
          include: {
            celulas: true
          }
        }
      }
    });

    console.log('👥 Criando alunos...');

    // Criar alunos
    const joao = await prisma.aluno.create({
      data: {
        nome: 'João Silva',
        cpf: '123.456.789-00',
        email: 'joao@example.com',
        telefone: '(11) 98765-4321',
        idade: 25,
        usaOculos: true,
        destroCanhoto: 'DESTRO',
        cursoId: cursoAvancado.id,
        alunoModulos: {
          create: cursoAvancado.modulos.map(modulo => ({
            moduloId: modulo.id,
            status: 'pendente',
            dataInicio: null,
            dataFim: null
          }))
        }
      }
    });

    const maria = await prisma.aluno.create({
      data: {
        nome: 'Maria Santos',
        cpf: '987.654.321-00',
        email: 'maria@example.com',
        telefone: '(11) 91234-5678',
        idade: 30,
        usaOculos: false,
        destroCanhoto: 'DESTRO',
        cursoId: cursoBasico.id,
        alunoModulos: {
          create: cursoBasico.modulos.map(modulo => ({
            moduloId: modulo.id,
            status: 'pendente',
            dataInicio: null,
            dataFim: null
          }))
        }
      }
    });

    const pedro = await prisma.aluno.create({
      data: {
        nome: 'Pedro Oliveira',
        cpf: '456.789.123-00',
        email: 'pedro@example.com',
        telefone: '(11) 94567-8901',
        idade: 28,
        usaOculos: false,
        destroCanhoto: 'CANHOTO',
        cursoId: cursoAvancado.id,
        alunoModulos: {
          create: cursoAvancado.modulos.map(modulo => ({
            moduloId: modulo.id,
            status: 'pendente',
            dataInicio: null,
            dataFim: null
          }))
        }
      }
    });

    console.log('✅ Registrando algumas presenças...');

    // Registrar algumas presenças para João
    const joaoModulo1 = cursoAvancado.modulos[0];
    await Promise.all(
      joaoModulo1.celulas.slice(0, 2).map(async (celula, index) => {
        await prisma.presenca.create({
          data: {
            alunoId: joao.id,
            celulaId: celula.id,
            presente: true,
            horasFeitas: 4,
            data: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)) // Dias anteriores
          }
        });
      })
    );

    // Registrar uma presença para Maria
    const mariaModulo1 = cursoBasico.modulos[0];
    if (mariaModulo1.celulas[0]) {
      await prisma.presenca.create({
        data: {
          alunoId: maria.id,
          celulaId: mariaModulo1.celulas[0].id,
          presente: true,
          horasFeitas: 4,
          data: new Date()
        }
      });
    }

    console.log('✨ Seed concluído com sucesso!');
    console.log('Dados de acesso do administrador:');
    console.log('Email: admin@syssolda.com');
    console.log('Senha: admin123');

  } catch (error) {
    console.error('Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
