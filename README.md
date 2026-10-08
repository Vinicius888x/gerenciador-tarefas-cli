# Gerenciador de Tarefas CLI

Aplicação de linha de comando para cadastrar e acompanhar tarefas, desenvolvida como parte de um desafio técnico de Desenvolvedor Júnior.

## Sobre o projeto

O programa permite adicionar, listar, concluir e remover tarefas pelo terminal. Os dados permanecem armazenados entre execuções em um arquivo JSON local. Cada tarefa possui ID, descrição, status e data de criação.

## Tecnologias

- JavaScript com Node.js 18 ou superior.
- Módulos nativos `fs` e `path` do Node.js.
- JSON para persistência local.
- Sem dependências externas: não é necessário executar `npm install`.

## Como instalar

1. Instale o [Node.js](https://nodejs.org/) na versão 18 ou superior.
2. Abra um terminal e execute:

   ```bash
   git clone https://github.com/Vinicius888x/gerenciador-tarefas-cli.git
   cd gerenciador-tarefas-cli
   ```

3. Verifique sua instalação do Node.js:

   ```bash
   node --version
   ```

4. Execute a ajuda para confirmar que o projeto está funcionando:

   ```bash
   node index.js ajuda
   ```

Não é necessário configurar banco de dados, instalar bibliotecas ou criar manualmente arquivos de dados.

> **Observação:** o endereço de clone acima passa a funcionar depois que este repositório for publicado no GitHub com o nome `gerenciador-tarefas-cli`.

## Como usar

Execute os comandos dentro da pasta do projeto:

### Adicionar uma tarefa

```bash
node index.js adicionar "Estudar Git"
```

Saída:

```text
Tarefa #1 adicionada.
```

### Listar tarefas

```bash
node index.js listar
```

Exemplo de saída (a data é a da criação da tarefa):

```text
[ ] #1 Estudar Git  08/10/2026
```

### Concluir uma tarefa

```bash
node index.js concluir 1
```

Saída:

```text
Tarefa #1 concluída.
```

### Remover uma tarefa

```bash
node index.js remover 1
```

Saída:

```text
Tarefa #1 removida.
```

### Mostrar ajuda

```bash
node index.js ajuda
```

Saída:

```text
Gerenciador de tarefas

Comandos:
  node index.js adicionar "Descrição da tarefa"
  node index.js listar
  node index.js concluir ID
  node index.js remover ID
  node index.js ajuda
```

Se o comando for desconhecido, o ID não existir ou a descrição estiver vazia, o programa exibe uma mensagem clara de erro e termina com código de saída diferente de zero.

## Como foi o desenvolvimento

O projeto foi dividido inicialmente em três responsabilidades: entrada e saída pelo terminal (`index.js`), regras de tarefas (`src/tarefas.js`) e leitura/gravação do JSON (`src/armazenamento.js`). A persistência usa escrita em arquivo temporário seguida de renomeação, reduzindo o risco de deixar um JSON parcialmente escrito. O próximo ID também é salvo para evitar reutilizar identificadores após remoções.

**Registro do desenvolvimento:** esta seção será ampliada durante o desafio com as decisões, dificuldades realmente encontradas e respectivas soluções.

## Próximos passos

- Adicionar filtro de listagem por status.
- Permitir editar descrições.
- Criar testes automatizados e revisar cenários de erro.
- Verificar o README em um clone limpo antes da entrega final.
