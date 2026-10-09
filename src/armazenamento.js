const fs = require('node:fs');
const path = require('node:path');

const arquivo = path.join(__dirname, '..', 'data', 'tarefas.json');

function dadosIniciais() {
  return { tarefas: [] };
}

function carregarDados() {
  if (!fs.existsSync(arquivo)) {
    return dadosIniciais();
  }

  let dados;

  try {
    dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  } catch (erro) {
    if (erro instanceof SyntaxError) {
      throw new Error('O arquivo de tarefas possui JSON inválido. Verifique data/tarefas.json.');
    }
    throw erro;
  }

  if (
  !dados ||
  !Array.isArray(dados.tarefas)
){
    throw new Error('O arquivo de tarefas está em um formato inesperado.');
  }

  return dados;
}

function salvarDados(dados) {
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });

  const temporario = `${arquivo}.${process.pid}.tmp`;

  try {
    fs.writeFileSync(temporario, `${JSON.stringify(dados, null, 2)}\n`, 'utf8');
    fs.renameSync(temporario, arquivo);
  } finally {
    if (fs.existsSync(temporario)) {
      fs.unlinkSync(temporario);
    }
  }
}

module.exports = { carregarDados, salvarDados };
