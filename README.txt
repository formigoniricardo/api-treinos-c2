#  MarombApp - API REST (C2)

API REST desenvolvida como avaliação prática da Composição 2 (C2) utilizando Node.js, TypeScript, Express, Prisma ORM e SQLite. O domínio escolhido foi o gerenciamento de treinos de força e musculação (MarombApp).

---

##  Domínio e Entidades

O sistema permite que atletas se cadastrem, gerenciem suas fichas de treino e adicionem exercícios a essas fichas. O projeto possui regras rígidas de **controle de propriedade** (um atleta não pode alterar ou apagar o treino de outro).

* **User:** Representa o atleta (nome, email, senha com hash bcrypt, papel/role).
* **Workout:** Representa a ficha de treino de um atleta (título, descrição, pertencente a um User).
* **Exercise:** Representa os exercícios detalhados de um treino (nome, séries, repetições, pertencente a um Workout).

---

##  Tecnologias Utilizadas

A stack foi construída para garantir tipagem estática, segurança e testes rigorosos:

* **Runtime & Linguagem:** Node.js 20+ com TypeScript (ES Modules)
* **Framework HTTP:** Express.js
* **ORM & Banco de Dados:** Prisma ORM com adapter `better-sqlite3` e banco local SQLite
* **Validação:** Zod (Validação de schemas de entrada)
* **Segurança:** JWT (JSON Web Token) + bcrypt (Hash de senhas)
* **Qualidade & Testes:** Vitest + Supertest (Testes unitários e de integração com cobertura >70%)

---

##  Como instalar e rodar o projeto

**1. Clone o repositório:**
```bash
git clone <coloque-o-link-do-seu-repositorio-aqui>
cd api-treinos-c2
2. Instale as dependências:

Bash
npm install
3. Configure as variáveis de ambiente:
Crie um arquivo .env na raiz do projeto (baseado no .env.example) e insira:

Snippet de código
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="sua_chave_secreta_aqui"
PORT=3000
4. Rode as migrações para gerar o banco SQLite:

Bash
npx prisma migrate dev
5. Inicie o servidor em modo de desenvolvimento:

Bash
npm run dev
(O servidor estará rodando em http://localhost:3000)

- Como rodar os testes automatizados
A API possui uma suíte completa de testes unitários (focados nos helpers de autenticação) e testes de integração (focados no fluxo de CRUD, autenticação e regras de propriedade).

Para rodar todos os testes de uma vez:

Bash
npm run test
Para gerar o relatório de cobertura (Coverage):

Bash
npm run test:coverage
(A cobertura atende ao requisito mínimo da C2, ultrapassando a marca de 70% em Linhas e Funções).

- Exemplos de Requisições (Payloads)
Abaixo estão exemplos rápidos para testar as rotas no Insomnia ou Postman.

1. Criar um novo Atleta (POST /auth/register)
JSON
{
  "name": "Ronnie Coleman",
  "email": "lightweight@maromba.com",
  "password": "senha-segura-123"
}
2. Fazer Login (POST /auth/login)
JSON
{
  "email": "lightweight@maromba.com",
  "password": "senha-segura-123"
}
(A resposta devolverá um Token JWT que deve ser enviado no Header Authorization: Bearer <token> nas próximas requisições).

3. Criar uma Ficha de Treino (POST /workouts)
Requer: Autenticação (Token JWT)

JSON
{
  "title": "Treino A - Peito e Tríceps",
  "description": "Foco total em hipertrofia e carga máxima"
}
4. Adicionar um Exercício ao Treino (POST /exercises)
Requer: Autenticação (Token JWT) e ser o dono do Treino

JSON
{
  "name": "Supino Reto com Barra",
  "sets": 4,
  "reps": "8-10",
  "workoutId": "id-do-treino-criado-acima"
}