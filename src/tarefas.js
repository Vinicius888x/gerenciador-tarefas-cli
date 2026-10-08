function adicionarTarefa(dados, descricao) {
  const texto = descricao.trim();

  if (!texto) {
    throw new Error('A descrição da tarefa não pode estar vazia.');
  }

  const tarefa = {
    id: dados.proximoId,
    descricao: texto,
    status: 'pendente',
    criadaEm: new Date().toISOString()
  };

  dados.tarefas.push(tarefa);
  dados.proximoId += 1;
  return tarefa;
}

function encontrarTarefa(dados, id) {
  const tarefa = dados.tarefas.find((item) => item.id === id);

  if (!tarefa) {
    throw new Error(`Tarefa #${id} não encontrada.`);
  }

  return tarefa;
}

function concluirTarefa(dados, id) {
  const tarefa = encontrarTarefa(dados, id);

  if (tarefa.status === 'concluída') {
    return false;
  }

  tarefa.status = 'concluída';
  return true;
}

function removerTarefa(dados, id) {
  encontrarTarefa(dados, id);
  dados.tarefas = dados.tarefas.filter((item) => item.id !== id);
}

module.exports = { adicionarTarefa, concluirTarefa, removerTarefa };
