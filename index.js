#!/usr/bin/env node

const { carregarDados, salvarDados } = require('./src/armazenamento');
const {
  adicionarTarefa,
  concluirTarefa,
  editarTarefa,
  filtrarTarefas,
  removerTarefa
} = require('./src/tarefas');

function mostrarAjuda() {
  console.log(`Gerenciador de tarefas

Comandos:
  tarefas adicionar "Descrição da tarefa"
  tarefas listar [pendentes|concluidas]
  tarefas concluir ID
  tarefas editar ID "Nova descrição"
  tarefas remover ID
  tarefas ajuda

Também é possível substituir "tarefas" por "node index.js" dentro da pasta do projeto.`);
}

function lerId(valor, comando) {
  if (!valor || !/^[1-9]\d*$/.test(valor)) {
    throw new Error(`Informe um ID positivo. Exemplo: tarefas ${comando} 1`);
  }

  const id = Number(valor);
  if (!Number.isSafeInteger(id)) {
    throw new Error('O ID informado é muito grande.');
  }
  return id;
}

function lerDescricao(argumentos, comando) {
  const descricao = argumentos.join(' ').trim();
  if (!descricao) {
    const exemplo = comando === 'editar'
      ? 'tarefas editar 1 "Revisar Git"'
      : 'tarefas adicionar "Estudar Git"';
    throw new Error(`Informe uma descrição. Exemplo: ${exemplo}`);
  }
  return descricao;
}

function lerFiltro(argumentos) {
  if (argumentos.length === 0) return null;
  if (argumentos.length !== 1 || !['pendentes', 'concluidas'].includes(argumentos[0])) {
    throw new Error('Filtro inválido. Use: tarefas listar [pendentes|concluidas]');
  }
  return argumentos[0];
}

function mostrarTarefas(dados, filtro) {
  const tarefas = filtrarTarefas(dados, filtro);

  if (tarefas.length === 0) {
    const mensagens = {
      pendentes: 'Nenhuma tarefa pendente.',
      concluidas: 'Nenhuma tarefa concluída.'
    };
    console.log(mensagens[filtro] || 'Nenhuma tarefa cadastrada.');
    return;
  }

  for (const tarefa of tarefas) {
    const marcador = tarefa.status === 'concluída' ? '[x]' : '[ ]';
    const data = new Date(tarefa.criadaEm).toLocaleDateString('pt-BR');
    console.log(`${marcador} #${tarefa.id} ${tarefa.descricao}  ${data}`);
  }
}

function executar() {
  const [comando, ...argumentos] = process.argv.slice(2);

  if (!comando || ['ajuda', '--help', '-h'].includes(comando)) {
    if (argumentos.length > 0) {
      throw new Error('O comando de ajuda não recebe argumentos.');
    }
    mostrarAjuda();
    return;
  }

  if (!['adicionar', 'listar', 'concluir', 'editar', 'remover'].includes(comando)) {
    throw new Error(`Comando "${comando}" não reconhecido. Use "tarefas ajuda".`);
  }

  let id;
  let descricao;
  let filtro;

  switch (comando) {
    case 'adicionar':
      descricao = lerDescricao(argumentos, comando);
      break;
    case 'listar':
      filtro = lerFiltro(argumentos);
      break;
    case 'concluir':
    case 'remover':
      if (argumentos.length !== 1) {
        throw new Error(`Uso: tarefas ${comando} ID`);
      }
      id = lerId(argumentos[0], comando);
      break;
    case 'editar':
      id = lerId(argumentos[0], comando);
      descricao = lerDescricao(argumentos.slice(1), comando);
      break;
  }

  const dados = carregarDados();

  switch (comando) {
    case 'adicionar': {
      const tarefa = adicionarTarefa(dados, descricao);
      salvarDados(dados);
      console.log(`Tarefa #${tarefa.id} adicionada.`);
      break;
    }
    case 'listar':
      mostrarTarefas(dados, filtro);
      break;
    case 'concluir': {
      const alterada = concluirTarefa(dados, id);
      if (alterada) {
        salvarDados(dados);
        console.log(`Tarefa #${id} concluída.`);
      } else {
        console.log(`Tarefa #${id} já estava concluída.`);
      }
      break;
    }
    case 'editar': {
      const alterada = editarTarefa(dados, id, descricao);
      if (alterada) {
        salvarDados(dados);
        console.log(`Tarefa #${id} atualizada.`);
      } else {
        console.log(`Tarefa #${id} já possui essa descrição.`);
      }
      break;
    }
    case 'remover':
      removerTarefa(dados, id);
      salvarDados(dados);
      console.log(`Tarefa #${id} removida.`);
      break;
  }
}

try {
  executar();
} catch (erro) {
  console.error(`Erro: ${erro.message}`);
  process.exitCode = 1;
}
