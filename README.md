# Gerenciador de Tarefas CLI

Aplicação de terminal para organizar tarefas, desenvolvida em JavaScript/Node.js para o desafio técnico de Desenvolvedor Júnior da DPlay Solutions.

## Sobre o projeto

O programa permite **adicionar, listar, filtrar, concluir, editar e remover tarefas**. Cada tarefa possui um ID, uma descrição, um status (`pendente` ou `concluída`) e uma data de criação.

Os dados são armazenados localmente em `data/tarefas.json` e continuam disponíveis depois que o programa é fechado. Cada ID é único **entre as tarefas que estão cadastradas no momento**.

## Tecnologias

- **JavaScript** com **Node.js 18 ou superior**.
- Módulos nativos do Node.js, incluindo `node:fs`, `node:path` e `node:test`.
- **JSON** para persistência local dos dados.
- **npm** para executar os testes e, opcionalmente, registrar o comando curto `tarefas`.
- **Sem dependências externas**: não é necessário executar `npm install` para usar o programa ou rodar os testes.

## Como instalar e executar

**Pré-requisitos:** Git e Node.js 18 ou superior.

Abra um terminal e execute **exatamente nesta ordem**:

```bash
git clone https://github.com/Vinicius888x/gerenciador-tarefas-cli.git
cd gerenciador-tarefas-cli
node --version
node index.js ajuda
```

Se a ajuda for exibida, a aplicação está pronta para uso. Não é necessário instalar pacotes, configurar um banco de dados, criar manualmente a pasta `data` nem definir variáveis de ambiente.

### Opcional: usar o comando curto `tarefas`

Se preferir digitar `tarefas` em vez de `node index.js`, execute **uma vez**, na pasta do projeto:

```bash
npm link
tarefas ajuda
```

O comando `npm link` registra um vínculo no ambiente do npm. Assim, é possível usar `tarefas` também de outras pastas. Os dados continuam sendo armazenados em `data/tarefas.json`, dentro deste projeto.

O uso de `npm link` **não é obrigatório**. Todos os comandos descritos a seguir funcionam diretamente com `node index.js` na pasta do repositório.

Para desfazer o vínculo global do npm, execute `npm unlink -g gerenciador-tarefas-cli`.

## Como usar

Os exemplos abaixo usam a forma de execução que não exige `npm link`. Quem instalou o comando curto pode substituir `node index.js` por `tarefas`.

As saídas e datas são **ilustrativas**: o ID depende das tarefas existentes e a data corresponde ao dia em que a tarefa foi criada.

### Adicionar uma tarefa

```bash
node index.js adicionar "Estudar Git"
```

```text
Tarefa #1 adicionada.
```

### Listar todas as tarefas

```bash
node index.js listar
```

```text
[ ] #1 Estudar Git  08/10/2026
```

O marcador `[ ]` indica uma tarefa pendente; `[x]`, uma tarefa concluída.

### Filtrar por status

```bash
node index.js listar pendentes
node index.js listar concluidas
```

Exemplo da listagem de pendentes após concluir a tarefa #1 e cadastrar a tarefa #2:

```text
[ ] #2 Revisar JavaScript  08/10/2026
```

O comando `listar concluidas` apresenta somente as tarefas concluídas.

### Concluir uma tarefa

```bash
node index.js concluir 1
```

```text
Tarefa #1 concluída.
```

Concluir uma tarefa muda seu status, mas **não a remove da lista**.

### Editar a descrição

```bash
node index.js editar 1 "Estudar Git e GitHub"
```

```text
Tarefa #1 atualizada.
```

A edição preserva o ID, o status e a data de criação.

### Remover uma tarefa

```bash
node index.js remover 1
```

```text
Tarefa #1 removida.
```

### Exibir a ajuda

```bash
node index.js ajuda
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

A ajuda exibe os comandos na forma abreviada `tarefas`, mas eles também funcionam usando `node index.js`.

### Exemplos de erros

ID inexistente:

```bash
node index.js concluir 999
```

```text
Erro: Tarefa #999 não encontrada.
```

Descrição vazia:

```bash
node index.js adicionar ""
```

```text
Erro: Informe uma descrição. Exemplo: tarefas adicionar "Estudar Git"
```

Comandos ou filtros inválidos, descrições vazias e IDs incorretos geram mensagens claras. Em caso de erro, o processo termina com código de saída diferente de zero. Se o arquivo JSON estiver inválido ou contiver registros inconsistentes, o programa interrompe a operação sem sobrescrever o arquivo de dados.

## Como executar os testes

Na pasta do projeto, execute:

```bash
npm test
```

Os testes usam `node:test`, sem bibliotecas externas. Cobrem as regras de negócio, os comandos de terminal, a persistência, o tratamento de erros e a validação de dados armazenados. Os testes de integração trabalham com diretórios temporários separados e não modificam suas tarefas em `data/tarefas.json`.

## Como foi o desenvolvimento

O código foi organizado para separar responsabilidades:

- `index.js`: interpreta os argumentos do terminal, valida comandos e apresenta mensagens.
- `src/tarefas.js`: concentra as regras de negócio (adicionar, concluir, editar, filtrar e remover).
- `src/armazenamento.js`: lê, valida e grava o arquivo JSON local.
- `test/`: reúne testes das regras de negócio e da interface de terminal, inclusive cenários com dados inválidos.

**Decisões tomadas:**

- Calcular o próximo ID como **o maior ID ainda existente mais 1**, sem armazenar um contador `proximoId`. Tarefas concluídas continuam ocupando seus IDs. Remover uma tarefa intermediária não renumera as demais; remover a tarefa de maior ID pode permitir que seu número seja reutilizado em uma inclusão futura.
- Utilizar JSON para manter o projeto simples e independente de serviços ou banco de dados externo.
- Validar os registros lidos do JSON (ID, descrição, status e data) e rejeitar IDs duplicados ou inválidos antes de executar alterações. Também impedir que novos IDs ultrapassem o limite seguro de inteiros do JavaScript.
- Gravar primeiro em um arquivo temporário e depois renomeá-lo, reduzindo o risco de deixar um JSON parcialmente escrito em caso de falha durante a gravação.
- Oferecer `node index.js` como forma direta de execução e `npm link` como facilidade opcional, através do campo `bin` no `package.json`.
- Utilizar ferramentas nativas do Node.js nos testes para evitar dependências adicionais.

**Dificuldades e soluções encontradas:**

- Na primeira configuração no Codespaces, a pasta `src` não havia sido copiada completamente e ocorreu `Cannot find module './src/armazenamento'`. A estrutura de diretórios foi conferida e os arquivos ausentes foram copiados.
- Após alterar a regra de geração de IDs, alguns testes ainda esperavam a numeração anterior. Os testes foram adaptados para verificar a regra atual, incluindo os casos de remoção e conclusão de tarefas.
- A auditoria identificou que JSON válido sintaticamente ainda podia conter tarefas inválidas ou IDs duplicados. Foi acrescentada uma validação detalhada durante a leitura, acompanhada de testes para esses cenários.

## Próximos passos

Com mais tempo, seria interessante adicionar prioridade e prazo às tarefas, permitir a ordenação da listagem, implementar exportação de dados e estudar um armazenamento apropriado para múltiplos usuários ou acessos simultâneos.

## Observações

- As tarefas são armazenadas localmente; a aplicação não envia esses dados para a internet.
- O arquivo `data/tarefas.json` é ignorado pelo Git via `.gitignore`, para evitar publicar tarefas pessoais ou dados de teste.
- A aplicação foi projetada para uso local e **sequencial**: execuções simultâneas que escrevam no mesmo arquivo não são suportadas.
- Somente o comando `remover` exclui uma tarefa. O comando `concluir` apenas altera seu status.
