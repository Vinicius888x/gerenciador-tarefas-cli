const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { adicionarTarefa, editarTarefa } = require('../src/tarefas');

function criarAmbiente(t) {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'dplay-extremos-'));
  const origem = path.resolve(__dirname, '..');
  fs.copyFileSync(path.join(origem, 'index.js'), path.join(pasta, 'index.js'));
  fs.cpSync(path.join(origem, 'src'), path.join(pasta, 'src'), { recursive: true });
  const arquivo = path.join(pasta, 'data', 'tarefas.json');
  fs.mkdirSync(path.dirname(arquivo));
  t.after(() => fs.rmSync(pasta, { recursive: true, force: true }));

  return {
    arquivo,
    executar(...argumentos) {
      return spawnSync(process.execPath, ['index.js', ...argumentos], {
        cwd: pasta,
        encoding: 'utf8',
        env: { ...process.env, NODE_OPTIONS: '' }
      });
    }
  };
}

function tarefaValida(alteracoes = {}) {
  return {
    id: 1,
    descricao: 'Estudar Git',
    status: 'pendente',
    criadaEm: '2026-10-09T14:00:00.000Z',
    ...alteracoes
  };
}

test('normaliza quebras de linha ao adicionar ou editar via regras de negócio', () => {
  const dados = { tarefas: [] };
  const tarefa = adicionarTarefa(dados, '  Estudar\nGit\r\n hoje  ');
  assert.equal(tarefa.descricao, 'Estudar Git hoje');
  assert.equal(editarTarefa(dados, 1, 'Revisar\rJavaScript'), true);
  assert.equal(tarefa.descricao, 'Revisar JavaScript');
});

test('CLI mantém a listagem em uma linha por tarefa e persiste a descrição normalizada', (t) => {
  const cli = criarAmbiente(t);
  assert.equal(cli.executar('adicionar', 'Estudar\n[ ] #999 Inventada').status, 0);
  assert.equal(cli.executar('editar', '1', 'Revisar\r\nNode.js').status, 0);

  const listagem = cli.executar('listar');
  assert.equal(listagem.status, 0);
  const linhas = listagem.stdout.trim().split(/\r?\n/);
  assert.equal(linhas.length, 1);
  assert.match(linhas[0], /^\[ \] #1 Revisar Node\.js\s+\d{2}\/\d{2}\/\d{4}$/);
  assert.equal(JSON.parse(fs.readFileSync(cli.arquivo, 'utf8')).tarefas[0].descricao, 'Revisar Node.js');
});

test('rejeita data impossível normalizada pelo JavaScript sem sobrescrever o arquivo', (t) => {
  const cli = criarAmbiente(t);
  const anterior = JSON.stringify({ tarefas: [tarefaValida({
    criadaEm: '2026-02-30T12:00:00.000Z'
  })] }, null, 2) + '\n';
  fs.writeFileSync(cli.arquivo, anterior, 'utf8');
  const resposta = cli.executar('listar');
  assert.equal(resposta.status, 1);
  assert.match(resposta.stderr, /registros inválidos/);
  assert.equal(fs.readFileSync(cli.arquivo, 'utf8'), anterior);
});

test('aceita uma data ISO válida em ano bissexto', (t) => {
  const cli = criarAmbiente(t);
  fs.writeFileSync(cli.arquivo, JSON.stringify({ tarefas: [tarefaValida({
    criadaEm: '2024-02-29T12:00:00.000Z'
  })] }), 'utf8');
  const resposta = cli.executar('listar');
  assert.equal(resposta.status, 0);
  assert.match(resposta.stdout, /#1 Estudar Git/);
});

test('rejeita descrição com quebra de linha inserida manualmente no JSON', (t) => {
  const cli = criarAmbiente(t);
  const anterior = JSON.stringify({ tarefas: [tarefaValida({
    descricao: 'Estudar\n[ ] #999 Falsa'
  })] });
  fs.writeFileSync(cli.arquivo, anterior, 'utf8');
  const resposta = cli.executar('listar');
  assert.equal(resposta.status, 1);
  assert.match(resposta.stderr, /registros inválidos/);
  assert.equal(fs.readFileSync(cli.arquivo, 'utf8'), anterior);
});
