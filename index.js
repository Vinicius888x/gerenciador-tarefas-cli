const { carregarDados, salvarDados } = require('./src/armazenamento');
const { adicionarTarefa, concluirTarefa, removerTarefa } = require('./src/tarefas');

function mostrarAjuda() {
  console.log(`Gerenciador de tarefas

Comandos:
  node index.js adicionar "Descrição da tarefa"
  node index.js listar
  node index.js concluir ID
  node index.js remover ID
  node index.js ajuda`);
}

function lerId(argumentos, comando) {
  if (argumentos.length !== 1 || !/^[1-9]\d*$/.test(argumentos[0])) {
    throw new Error(`Informe um ID positivo. Exemplo: node index.js ${comando} 1`);
  }

  const id = Number(argumentos[0]);

  if (!Number.isSafeInteger(id)) {
    throw new Error('O ID informado é muito grande.');
  }

  return id;
}

function listarTarefas(dados) {
  if (dados.tarefas.length === 0) {
    console.log('Nenhuma tarefa cadastrada.');
    return;
  }

  for (const tarefa of dados.tarefas) {
    const marcador = tarefa.status === 'concluída' ? '[x]' : '[ ]';
    const data = new Date(tarefa.criadaEm).toLocaleDateString('pt-BR');
    console.log(`${marcador} #${tarefa.id} ${tarefa.descricao}  ${data}`);
  }
}

function executar() {
  const [comando, ...argumentos] = process.argv.slice(2);

  if (!comando || comando === 'ajuda' || comando === '--help' || comando === '-h') {
    if (argumentos.length > 0) {
      throw new Error('O comando de ajuda não recebe argumentos.');
    }
    mostrarAjuda();
    return;
  }

  if (!['adicionar', 'listar', 'concluir', 'remover'].includes(comando)) {
    throw new Error(`Comando "${comando}" não reconhecido. Use "node index.js ajuda".`);
  }

  if (comando === 'listar' && argumentos.length > 0) {
    throw new Error('O comando listar não recebe argumentos.');
  }

  if (comando === 'adicionar' && argumentos.join(' ').trim() === '') {
    throw new Error('Informe uma descrição. Exemplo: node index.js adicionar "Estudar Git"');
  }

  const id = ['concluir', 'remover'].includes(comando) ? lerId(argumentos, comando) : null;
  const dados = carregarDados();

  switch (comando) {
    case 'adicionar': {
      const tarefa = adicionarTarefa(dados, argumentos.join(' '));
      salvarDados(dados);
      console.log(`Tarefa #${tarefa.id} adicionada.`);
      break;
    }
    case 'listar':
      listarTarefas(dados);
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
