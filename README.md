# Gerenciador de Tarefas CLI

Aplicação de terminal para organizar tarefas. Desenvolvida em JavaScript/Node.js para o desafio técnico de Desenvolvedor Júnior da DPlay Solutions.

## Sobre o projeto

O programa permite **adicionar, listar, filtrar, concluir, editar e remover tarefas**. Cada tarefa tem um ID único, descrição, status (`pendente` ou `concluída`) e data de criação. Os dados são guardados localmente em `data/tarefas.json` e continuam disponíveis depois que o programa é fechado.

## Tecnologias

- **JavaScript** no **Node.js 18 ou superior**.
- Bibliotecas nativas `fs` (arquivos), `path` (caminhos) e `node:test` (testes).
- **JSON** para persistência dos dados.
- **npm** para registrar o comando `tarefas` com `npm link`.
- Nenhuma dependência externa; não é preciso rodar `npm install`.

## Como instalar

Pré-requisitos: **Git** e **Node.js 18+**, com npm (incluído na instalação padrão do Node.js).

Abra um terminal e execute, nesta ordem:

```bash
git clone https://github.com/Vinicius888x/gerenciador-tarefas-cli.git
cd gerenciador-tarefas-cli
node --version
npm link
tarefas ajuda
```

O comando `npm link` registra `tarefas` no ambiente do npm. É uma configuração de desenvolvimento feita uma vez para esta instalação; você poderá executar `tarefas` mesmo fora da pasta do projeto. As tarefas continuam sendo salvas **na pasta `data` deste repositório**.

**Alternativa sem `npm link`:** dentro da pasta do projeto, substitua `tarefas` por `node index.js`. Por exemplo:

```bash
node index.js ajuda
```

Se o terminal informar que não reconhece `tarefas`, confira se `npm link` terminou sem erros. Não é necessário criar manualmente a pasta `data`, instalar banco de dados ou adicionar variáveis de ambiente.

## Como usar

Após instalar, execute os comandos abaixo. As saídas e datas mostradas são **exemplos**: o número do ID depende das tarefas cadastradas, e a data será a do momento da criação.

### Adicionar

```bash
tarefas adicionar "Estudar Git"
```

```text
Tarefa #1 adicionada.
```

### Listar todas

```bash
tarefas listar
```

```text
[ ] #1 Estudar Git  08/10/2026
```

O marcador `[ ]` indica tarefa pendente; `[x]`, tarefa concluída.

### Filtrar por status

```bash
tarefas listar pendentes
tarefas listar concluidas
```

Exemplo após concluir a tarefa #1 e cadastrar uma tarefa #2:

```text
[ ] #2 Revisar JavaScript  08/10/2026
```

O exemplo acima corresponde à listagem de `pendentes`. O comando `listar concluidas` exibirá apenas tarefas concluídas.

### Concluir

```bash
tarefas concluir 1
```

```text
Tarefa #1 concluída.
```

### Editar a descrição

```bash
tarefas editar 1 "Estudar Git e GitHub"
```

```text
Tarefa #1 atualizada.
```

A edição mantém o ID, a data de criação e o status da tarefa.

### Remover

```bash
tarefas remover 1
```

```text
Tarefa #1 removida.
```

### Ajuda

```bash
tarefas ajuda
```

```text
Gerenciador de tarefas

Comandos:
  tarefas adicionar "Descrição da tarefa"
  tarefas listar [pendentes|concluidas]
  tarefas concluir ID
  tarefas editar ID "Nova descrição"
  tarefas remover ID
  tarefas ajuda

Também é possível substituir "tarefas" por "node index.js" dentro da pasta do projeto.
```

### Exemplos de erros

```bash
tarefas concluir 999
```

```text
Erro: Tarefa #999 não encontrada.
```

```bash
tarefas adicionar ""
```

```text
Erro: Informe uma descrição. Exemplo: tarefas adicionar "Estudar Git"
```

Comandos ou filtros inválidos, descrições vazias e IDs incorretos produzem mensagens claras. Nessas situações o programa retorna código de saída diferente de zero.

## Como executar os testes

Dentro da pasta do projeto:

```bash
npm test
```

Os testes automatizados utilizam o executor nativo `node:test`, sem bibliotecas externas, e verificam as regras de negócio, os comandos, a persistência e os erros. Os testes de terminal criam diretórios temporários separados, sem modificar seu arquivo pessoal `data/tarefas.json`.

## Como foi o desenvolvimento

O código foi dividido para separar responsabilidades:

- `index.js`: interpreta argumentos do terminal, valida comandos e apresenta mensagens.
- `src/tarefas.js`: implementa as regras de negócio (adicionar, concluir, editar, filtrar e remover).
- `src/armazenamento.js`: lê e grava o JSON local.
- `test/`: testes unitários e testes de integração da CLI.

**Decisões:**

- Guardar `proximoId` junto com as tarefas para não reutilizar IDs após remoções.
- Persistir os dados em JSON para manter o projeto simples, sem serviços ou dependências externas.
- Gravar primeiro em arquivo temporário e depois renomeá-lo, reduzindo o risco de um JSON parcialmente escrito.
- Usar `npm link` e a propriedade `bin` do `package.json` para oferecer o comando curto `tarefas`, mantendo `node index.js` como alternativa.
- Manter os testes com ferramentas nativas do Node.js para facilitar a instalação.

**Dificuldades e soluções encontradas:**

- Durante a primeira configuração no Codespaces, a pasta `src` não havia sido copiada corretamente, causando o erro `Cannot find module './src/armazenamento'`. A solução foi conferir a estrutura de diretórios e copiar os arquivos ausentes.
- Com o crescimento do número de comandos, a leitura dos argumentos foi separada em funções menores de validação. Isso ajuda a padronizar as mensagens de erro.

## Próximos passos

Com mais tempo, seria interessante adicionar prioridade e prazo às tarefas, ordenar a listagem, oferecer exportação de dados e estudar um armazenamento adequado para múltiplas pessoas ou acessos simultâneos.

## Observações

- Os dados são locais à pasta do projeto e não são enviados para a internet.
- O arquivo `data/tarefas.json` está no `.gitignore` para evitar publicar tarefas pessoais ou dados de teste.
- Para desfazer o link global do npm, execute `npm unlink -g gerenciador-tarefas-cli`.
