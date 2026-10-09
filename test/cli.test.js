const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function prepararProjeto(t) {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'dplay-cli-test-'));
  const origem = path.resolve(__dirname, '..');

  fs.copyFileSync(path.join(origem, 'index.js'), path.join(pasta, 'index.js'));
  fs.cpSync(path.join(origem, 'src'), path.join(pasta, 'src'), { recursive: true });
  t.after(() => fs.rmSync(pasta, { recursive: true, force: true }));

  return {
    pasta,
    executar(...args) {
      return spawnSync(process.execPath, ['index.js', ...args], {
        cwd: pasta,
        encoding: 'utf8',
        env: { ...process.env, NODE_OPTIONS: '' }
      });
    },
    lerDados() {
      return JSON.parse(fs.readFileSync(path.join(pasta, 'data', 'tarefas.json'), 'utf8'));
    }
  };
}

test('ajuda funciona sem criar arquivo de dados', (t) => {
  const cli = prepararProjeto(t);
  const saida = cli.executar('ajuda');

  assert.equal(saida.status, 0);
  assert.match(saida.stdout, /tarefas adicionar/);
  assert.match(saida.stdout, /tarefas editar/);
  assert.equal(fs.existsSync(path.join(cli.pasta, 'data', 'tarefas.json')), false);
});

test('adiciona, lista, conclui, edita e remove por terminal', (t) => {
  const cli = prepararProjeto(t);

  assert.match(cli.executar('listar').stdout, /Nenhuma tarefa cadastrada/);
  assert.match(cli.executar('adicionar', 'Estudar Git').stdout, /#1 adicionada/);
  assert.match(cli.executar('adicionar', 'Aprender Node').stdout, /#2 adicionada/);
  assert.match(cli.executar('listar').stdout, /\[ \] #1 Estudar Git/);
  assert.match(cli.executar('concluir', '1').stdout, /#1 concluída/);
  assert.match(cli.executar('editar', '2', 'Revisar Node.js').stdout, /#2 atualizada/);

  const pendentes = cli.executar('listar', 'pendentes');
  assert.match(pendentes.stdout, /#2 Revisar Node.js/);
  assert.doesNotMatch(pendentes.stdout, /#1 Estudar Git/);

  const concluidas = cli.executar('listar', 'concluidas');
  assert.match(concluidas.stdout, /\[x\] #1 Estudar Git/);
  assert.doesNotMatch(concluidas.stdout, /#2 Revisar Node.js/);

  assert.match(cli.executar('remover', '2').stdout, /#2 removida/);
  assert.match(cli.executar('adicionar', 'Terceira').stdout, /#2 adicionada/);

  const dados = cli.lerDados();
  assert.deepEqual(dados.tarefas.map((item) => item.id), [1, 2]);
  assert.equal(dados.tarefas[0].status, 'concluída');
});

test('dados continuam disponíveis em execuções diferentes', (t) => {
  const cli = prepararProjeto(t);
  cli.executar('adicionar', 'Persistir');
  const outraExecucao = cli.executar('listar');
  assert.equal(outraExecucao.status, 0);
  assert.match(outraExecucao.stdout, /Persistir/);
});

test('comandos inválidos e IDs inexistentes retornam erro com exit code 1', (t) => {
  const cli = prepararProjeto(t);
  const casos = [
    [['invalido'], /não reconhecido/],
    [['adicionar', '   '], /Informe uma descrição/],
    [['listar', 'todas'], /Filtro inválido/],
    [['listar', 'pendentes', 'extra'], /Filtro inválido/],
    [['concluir', '0'], /ID positivo/],
    [['concluir', 'abc'], /ID positivo/],
    [['remover', '999'], /não encontrada/],
    [['editar', '123', 'Texto'], /não encontrada/],
    [['editar', '1', '   '], /Informe uma descrição/],
    [['ajuda', 'extra'], /não recebe argumentos/],
    [['concluir', '9007199254740999'], /muito grande/]
  ];

  for (const [args, mensagem] of casos) {
    const saida = cli.executar(...args);
    assert.equal(saida.status, 1, `Deveria falhar: ${args.join(' ')}`);
    assert.match(saida.stderr, mensagem);
  }
});

test('arquivo JSON inválido gera mensagem amigável e não é sobrescrito', (t) => {
  const cli = prepararProjeto(t);
  const data = path.join(cli.pasta, 'data');
  fs.mkdirSync(data);
  fs.writeFileSync(path.join(data, 'tarefas.json'), '{arquivo quebrado');

  const saida = cli.executar('listar');
  assert.equal(saida.status, 1);
  assert.match(saida.stderr, /JSON inválido/);
  assert.equal(fs.readFileSync(path.join(data, 'tarefas.json'), 'utf8'), '{arquivo quebrado');
});

test('listagem filtrada vazia informa corretamente o status', (t) => {
  const cli = prepararProjeto(t);
  cli.executar('adicionar', 'Tarefa A');
  assert.match(cli.executar('listar', 'concluidas').stdout, /Nenhuma tarefa concluída/);
});

test('tarefa já concluída e edição repetida não causam erro', (t) => {
  const cli = prepararProjeto(t);
  cli.executar('adicionar', 'Tarefa A');
  cli.executar('concluir', '1');

  const concluir = cli.executar('concluir', '1');
  const editar = cli.executar('editar', '1', 'Tarefa A');
  assert.equal(concluir.status, 0);
  assert.equal(editar.status, 0);
  assert.match(concluir.stdout, /já estava concluída/);
  assert.match(editar.stdout, /já possui essa descrição/);
});
