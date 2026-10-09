const test = require('node:test');
const assert = require('node:assert/strict');
const {
  adicionarTarefa,
  concluirTarefa,
  editarTarefa,
  filtrarTarefas,
  removerTarefa
} = require('../src/tarefas');

const criarDados = () => ({ tarefas: [] });

test('adiciona tarefa com propriedades esperadas', () => {
  const dados = criarDados();
  const tarefa = adicionarTarefa(dados, '  Estudar Git  ');

  assert.equal(tarefa.id, 1);
  assert.equal(tarefa.descricao, 'Estudar Git');
  assert.equal(tarefa.status, 'pendente');
  assert.equal(typeof tarefa.criadaEm, 'string');
  assert.ok(!Number.isNaN(Date.parse(tarefa.criadaEm)));
});

test('não aceita descrição vazia', () => {
  assert.throws(() => adicionarTarefa(criarDados(), '   '), /não pode estar vazia/);
});

test('conclui uma única vez e retorna se houve alteração', () => {
  const dados = criarDados();
  adicionarTarefa(dados, 'Teste');

  assert.equal(concluirTarefa(dados, 1), true);
  assert.equal(concluirTarefa(dados, 1), false);
  assert.equal(dados.tarefas[0].status, 'concluída');
});

test('edita a descrição sem alterar ID, status ou data', () => {
  const dados = criarDados();
  const tarefa = adicionarTarefa(dados, 'Antes');
  const criadaEm = tarefa.criadaEm;

  assert.equal(editarTarefa(dados, 1, '  Depois  '), true);
  assert.equal(editarTarefa(dados, 1, 'Depois'), false);
  assert.equal(tarefa.descricao, 'Depois');
  assert.equal(tarefa.id, 1);
  assert.equal(tarefa.status, 'pendente');
  assert.equal(tarefa.criadaEm, criadaEm);
});

test('filtra tarefas pendentes e concluídas', () => {
  const dados = criarDados();
  adicionarTarefa(dados, 'Primeira');
  adicionarTarefa(dados, 'Segunda');
  concluirTarefa(dados, 1);

  assert.deepEqual(filtrarTarefas(dados, 'pendentes').map((t) => t.id), [2]);
  assert.deepEqual(filtrarTarefas(dados, 'concluidas').map((t) => t.id), [1]);
  assert.equal(filtrarTarefas(dados).length, 2);
});

test('não reutiliza lacunas abaixo do maior ID', () => {
  const dados = criarDados();
  adicionarTarefa(dados, 'Primeira');
  adicionarTarefa(dados, 'Segunda');
  adicionarTarefa(dados, 'Terceira');
  removerTarefa(dados, 2);

  const nova = adicionarTarefa(dados, 'Quarta');
  assert.equal(nova.id, 4);
  assert.deepEqual(dados.tarefas.map((item) => item.id), [1, 3, 4]);
});

test('reutiliza o maior ID removido sem renumerar tarefas restantes', () => {
  const dados = criarDados();
  adicionarTarefa(dados, 'Primeira');
  adicionarTarefa(dados, 'Segunda');
  adicionarTarefa(dados, 'Terceira');
  removerTarefa(dados, 3);

  const nova = adicionarTarefa(dados, 'Nova terceira');
  assert.equal(nova.id, 3);
  assert.deepEqual(dados.tarefas.map((item) => item.id), [1, 2, 3]);
});

test('concluir tarefa não libera seu ID', () => {
  const dados = criarDados();
  adicionarTarefa(dados, 'Primeira');
  adicionarTarefa(dados, 'Segunda');
  concluirTarefa(dados, 2);

  const nova = adicionarTarefa(dados, 'Terceira');
  assert.equal(nova.id, 3);
  assert.equal(dados.tarefas[1].status, 'concluída');
});

test('reinicia numeração em 1 quando todas as tarefas foram removidas', () => {
  const dados = criarDados();
  adicionarTarefa(dados, 'Primeira');
  removerTarefa(dados, 1);
  assert.equal(adicionarTarefa(dados, 'Nova primeira').id, 1);
});

test('trata IDs inexistentes nas operações', () => {
  const dados = criarDados();
  assert.throws(() => concluirTarefa(dados, 8), /#8 não encontrada/);
  assert.throws(() => editarTarefa(dados, 8, 'Texto'), /#8 não encontrada/);
  assert.throws(() => removerTarefa(dados, 8), /#8 não encontrada/);
});

test('não aceita descrição vazia na edição', () => {
  const dados = criarDados();
  adicionarTarefa(dados, 'Antiga');
  assert.throws(() => editarTarefa(dados, 1, '  '), /não pode estar vazia/);
  assert.equal(dados.tarefas[0].descricao, 'Antiga');
});
