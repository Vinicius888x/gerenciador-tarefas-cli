const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { adicionarTarefa } = require('../src/tarefas');

function ambienteTemporario(t) {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'dplay-validacao-'));
  const projeto = path.resolve(__dirname, '..');
  fs.copyFileSync(path.join(projeto, 'index.js'), path.join(pasta, 'index.js'));
  fs.cpSync(path.join(projeto, 'src'), path.join(pasta, 'src'), { recursive: true });
  const diretorio = path.join(pasta, 'data');
  fs.mkdirSync(diretorio);
  const arquivo = path.join(diretorio, 'tarefas.json');
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

function tarefaValida(id, alteracoes = {}) {
  return {
    id,
    descricao: 'Estudar JavaScript',
    status: 'pendente',
    criadaEm: '2026-10-08T14:00:00.000Z',
    ...alteracoes
  };
}

function conferirRejeicao(t, lista) {
  const ambiente = ambienteTemporario(t);
  const conteudo = `${JSON.stringify({ tarefas: lista }, null, 2)}\n`;
  fs.writeFileSync(ambiente.arquivo, conteudo, 'utf8');
  const resposta = ambiente.executar('adicionar', 'Outra tarefa');
  assert.equal(resposta.status, 1);
  assert.match(resposta.stderr, /registros inválidos/i);
  assert.equal(fs.readFileSync(ambiente.arquivo, 'utf8'), conteudo);
}

test('rejeita tarefa null sem sobrescrever os dados', (t) => {
  conferirRejeicao(t, [null]);
});

test('rejeita ID não numérico sem sobrescrever os dados', (t) => {
  conferirRejeicao(t, [tarefaValida('abc')]);
});

test('rejeita IDs duplicados sem sobrescrever os dados', (t) => {
  conferirRejeicao(t, [tarefaValida(1), tarefaValida(1, { descricao: 'Outra' })]);
});

test('rejeita status e data inválidos', (t) => {
  conferirRejeicao(t, [tarefaValida(1, { status: 'inexistente' })]);
  conferirRejeicao(t, [tarefaValida(1, { criadaEm: 'data-inválida' })]);
});

test('rejeita o próximo ID fora do intervalo seguro, sem modificar a lista', () => {
  const dados = { tarefas: [tarefaValida(Number.MAX_SAFE_INTEGER)] };
  assert.throws(() => adicionarTarefa(dados, 'Nova tarefa'), /limite de IDs/i);
  assert.equal(dados.tarefas.length, 1);
});
