import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Limpar o banco de dados
  await prisma.alunoModulo.deleteMany();
  await prisma.aula.deleteMany();
  await prisma.modulo.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.curso.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('Banco de dados limpo');

  // Criar usuário admin
  const adminUser = await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'admin@syssolda.com',
      senha: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  });

  console.log('Usuário admin criado:', adminUser.email);

  // Criar cursos com módulos e aulas
  const soldaBasica = await prisma.curso.create({
    data: {
      nome: 'Solda Básica',
      descricao: 'Curso introdutório às técnicas de soldagem',
      cargaHorariaTotal: 60,
      preRequisitos: 'Nenhum',
      materialNecessario: 'Equipamento de proteção individual',
      modulos: {
        create: [
          {
            nome: 'Módulo 2 - Fundamentos',
            descricao: 'Técnicas fundamentais de soldagem',
            aulas: {
              create: [
                {
                  nome: 'Introdução à Soldagem 1F',
                  descricao: 'Posição plana - Filete',
                  cargaHoraria: 4,
                  siglaTecnica: '1F'
                },
                {
                  nome: 'Soldagem 2F',
                  descricao: 'Posição horizontal - Filete',
                  cargaHoraria: 4,
                  siglaTecnica: '2F'
                },
                {
                  nome: 'Soldagem 3F',
                  descricao: 'Posição vertical - Filete',
                  cargaHoraria: 4,
                  siglaTecnica: '3F'
                },
                {
                  nome: 'Soldagem 4F',
                  descricao: 'Posição sobre-cabeça - Filete',
                  cargaHoraria: 4,
                  siglaTecnica: '4F'
                }
              ],
            },
          },
          {
            nome: 'Módulo 3 - Técnicas Básicas',
            descricao: 'Soldagem em groove posições 1G e 2G',
            aulas: {
              create: [
                {
                  nome: 'Soldagem 1G - Parte 1',
                  descricao: 'Posição plana - Groove',
                  cargaHoraria: 4,
                  siglaTecnica: '1G'
                },
                {
                  nome: 'Soldagem 1G - Parte 2',
                  descricao: 'Posição plana - Groove Avançado',
                  cargaHoraria: 4,
                  siglaTecnica: '1G'
                },
                {
                  nome: 'Soldagem 2G - Parte 1',
                  descricao: 'Posição horizontal - Groove',
                  cargaHoraria: 4,
                  siglaTecnica: '2G'
                },
                {
                  nome: 'Soldagem 2G - Parte 2',
                  descricao: 'Posição horizontal - Groove Avançado',
                  cargaHoraria: 4,
                  siglaTecnica: '2G'
                }
              ],
            },
          }
        ],
      },
    },
    include: {
      modulos: {
        include: {
          aulas: true,
        },
      },
    },
  });

  const soldaAvancada = await prisma.curso.create({
    data: {
      nome: 'Solda Avançada',
      descricao: 'Técnicas avançadas de soldagem para profissionais',
      cargaHorariaTotal: 80,
      preRequisitos: 'Curso de Solda Básica ou experiência equivalente',
      materialNecessario: 'Equipamento de proteção individual, ferramentas específicas',
      modulos: {
        create: [
          {
            nome: 'Módulo 4 - Soldagem 3G',
            descricao: 'Técnicas de soldagem vertical em groove',
            aulas: {
              create: [
                {
                  nome: 'Soldagem 3G - Teoria',
                  descricao: 'Fundamentos da soldagem vertical',
                  cargaHoraria: 4,
                  siglaTecnica: '3G'
                },
                {
                  nome: 'Soldagem 3G - Prática Básica',
                  descricao: 'Exercícios iniciais',
                  cargaHoraria: 6,
                  siglaTecnica: '3G'
                },
                {
                  nome: 'Soldagem 3G - Prática Intermediária',
                  descricao: 'Exercícios intermediários',
                  cargaHoraria: 6,
                  siglaTecnica: '3G'
                },
                {
                  nome: 'Soldagem 3G - Prática Avançada',
                  descricao: 'Exercícios avançados',
                  cargaHoraria: 6,
                  siglaTecnica: '3G'
                }
              ],
            },
          },
          {
            nome: 'Módulo 5 - Soldagem 4G',
            descricao: 'Técnicas de soldagem sobre-cabeça em groove',
            aulas: {
              create: [
                {
                  nome: 'Soldagem 4G - Teoria',
                  descricao: 'Fundamentos da soldagem sobre-cabeça',
                  cargaHoraria: 4,
                  siglaTecnica: '4G'
                },
                {
                  nome: 'Soldagem 4G - Prática Básica',
                  descricao: 'Exercícios iniciais',
                  cargaHoraria: 6,
                  siglaTecnica: '4G'
                },
                {
                  nome: 'Soldagem 4G - Prática Intermediária',
                  descricao: 'Exercícios intermediários',
                  cargaHoraria: 6,
                  siglaTecnica: '4G'
                },
                {
                  nome: 'Soldagem 4G - Prática Avançada',
                  descricao: 'Exercícios avançados',
                  cargaHoraria: 6,
                  siglaTecnica: '4G'
                }
              ],
            },
          },
          {
            nome: 'Módulo 6 - Soldagem 2GT',
            descricao: 'Soldagem de tubulação - posição horizontal',
            aulas: {
              create: [
                {
                  nome: 'Soldagem 2GT - Teoria',
                  descricao: 'Fundamentos da soldagem de tubulação',
                  cargaHoraria: 4,
                  siglaTecnica: '2GT'
                },
                {
                  nome: 'Soldagem 2GT - Prática Básica',
                  descricao: 'Exercícios iniciais',
                  cargaHoraria: 6,
                  siglaTecnica: '2GT'
                },
                {
                  nome: 'Soldagem 2GT - Prática Intermediária',
                  descricao: 'Exercícios intermediários',
                  cargaHoraria: 6,
                  siglaTecnica: '2GT'
                },
                {
                  nome: 'Soldagem 2GT - Prática Avançada',
                  descricao: 'Exercícios avançados',
                  cargaHoraria: 6,
                  siglaTecnica: '2GT'
                }
              ],
            },
          },
          {
            nome: 'Módulo 7 - Soldagem 5GT',
            descricao: 'Soldagem de tubulação - posição 45 graus',
            aulas: {
              create: [
                {
                  nome: 'Soldagem 5GT - Teoria',
                  descricao: 'Fundamentos da soldagem em 45 graus',
                  cargaHoraria: 4,
                  siglaTecnica: '5GT'
                },
                {
                  nome: 'Soldagem 5GT - Prática Básica',
                  descricao: 'Exercícios iniciais',
                  cargaHoraria: 6,
                  siglaTecnica: '5GT'
                },
                {
                  nome: 'Soldagem 5GT - Prática Intermediária',
                  descricao: 'Exercícios intermediários',
                  cargaHoraria: 6,
                  siglaTecnica: '5GT'
                },
                {
                  nome: 'Soldagem 5GT - Prática Avançada',
                  descricao: 'Exercícios avançados',
                  cargaHoraria: 6,
                  siglaTecnica: '5GT'
                }
              ],
            },
          },
          {
            nome: 'Módulo 8 - Soldagem 6GT',
            descricao: 'Soldagem de tubulação - posição inclinada',
            aulas: {
              create: [
                {
                  nome: 'Soldagem 6GT - Teoria',
                  descricao: 'Fundamentos da soldagem inclinada',
                  cargaHoraria: 4,
                  siglaTecnica: '6GT'
                },
                {
                  nome: 'Soldagem 6GT - Prática Básica',
                  descricao: 'Exercícios iniciais',
                  cargaHoraria: 6,
                  siglaTecnica: '6GT'
                },
                {
                  nome: 'Soldagem 6GT - Prática Intermediária',
                  descricao: 'Exercícios intermediários',
                  cargaHoraria: 6,
                  siglaTecnica: '6GT'
                },
                {
                  nome: 'Soldagem 6GT - Prática Avançada',
                  descricao: 'Exercícios avançados',
                  cargaHoraria: 6,
                  siglaTecnica: '6GT'
                }
              ],
            },
          }
        ],
      },
    },
    include: {
      modulos: {
        include: {
          aulas: true,
        },
      },
    },
  });

  console.log('Cursos criados:', soldaBasica.nome, soldaAvancada.nome);

  // Criar alunos com módulos selecionados
  const dataAtual = new Date();
  const dataFutura = new Date();
  dataFutura.setMonth(dataFutura.getMonth() + 3);

  const aluno1 = await prisma.aluno.create({
    data: {
      nome: 'João Silva',
      cpf: '123.456.789-00',
      email: 'joao@exemplo.com',
      telefone: '(11) 98765-4321',
      idade: 25,
      usaOculos: true,
      destroCanhoto: 'DESTRO',
      cursoId: soldaBasica.id,
      alunoModulos: {
        create: [
          {
            moduloId: soldaBasica.modulos[0].id,
            status: 'EM_ANDAMENTO',
            dataInicio: dataAtual,
            dataTermino: dataFutura,
          },
          {
            moduloId: soldaBasica.modulos[1].id,
            status: 'PENDENTE',
            dataInicio: null,
            dataTermino: null,
          },
        ],
      },
    },
  });

  const aluno2 = await prisma.aluno.create({
    data: {
      nome: 'Maria Oliveira',
      cpf: '987.654.321-00',
      email: 'maria@exemplo.com',
      telefone: '(11) 91234-5678',
      idade: 30,
      usaOculos: false,
      destroCanhoto: 'CANHOTO',
      cursoId: soldaAvancada.id,
      alunoModulos: {
        create: [
          {
            moduloId: soldaAvancada.modulos[0].id,
            status: 'CONCLUIDO',
            dataInicio: new Date(dataAtual.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
            dataTermino: dataAtual,
          },
          {
            moduloId: soldaAvancada.modulos[1].id,
            status: 'EM_ANDAMENTO',
            dataInicio: dataAtual,
            dataTermino: dataFutura,
          },
        ],
      },
    },
  });

  console.log('Alunos criados:', aluno1.nome, aluno2.nome);

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 