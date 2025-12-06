# Documentação do Projeto N2 DevOps

## Visão Geral

Este repositório contém um ambiente demonstrativo de DevOps completo com:

- **Aplicação Node.js** com API REST e suite completa de testes unitários
- **Stack de ferramentas** para versionamento, CI/CD e registro de imagens Docker
- **Testes automatizados** com Jest, cobertura de código e validações
- **Pipeline CI/CD** integrado com Drone que executa testes e build automático
- **Ambiente auto-hospedado** para demonstrar fluxo completo DevOps

O objetivo é disponibilizar um ambiente funcional para demonstrar: controle de versão (Gitea), integração contínua (Drone CI), execução de pipelines com testes, armazenamento de imagens (Docker Registry) e uma aplicação de exemplo totalmente testada.

## Estrutura do Repositório

### Arquivos Principais
- `app.js`: Aplicação principal em Node.js (API REST com CRUD de usuários)
- `package.json`: Metadados do projeto e dependências (`express`, `cors`, `jest`, `supertest`)
- `Dockerfile`: Dockerfile multi-stage com stages para teste e produção
- `docker-compose.yml`: Orquestração completa (Gitea, Drone, Registry, App)
- `.drone.yml`: Pipeline CI/CD com testes automatizados
- `jest.config.js`: Configuração do Jest para testes
- `.gitignore`: Arquivos ignorados pelo Git

### Estrutura de Testes
- `tests/app.test.js`: Testes principais da API (CRUD, endpoints, validações)
- `tests/health.test.js`: Testes de healthcheck e monitoramento
- `tests/validation.test.js`: Testes de validação e edge cases
- `tests/setup.js`: Configuração global dos testes

### Dados e Configurações
- `config/`: Arquivos de configuração, chaves e certificados dos serviços
- `data/`: Diretórios de dados persistentes (volumes Docker)
- `logs/`: Logs dos serviços em execução

## Funcionamento Geral

Fluxo de alto nível:

1. O desenvolvedor faz push do código para o servidor Git (Gitea).
2. O Drone CI é notificado (via integração com Gitea) e executa pipelines configurados no repositório.
3. O pipeline constrói a imagem Docker usando o `Dockerfile` e faz o push para o Docker Registry privado.
4. A imagem pode ser visualizada no `Registry UI` e implantada em ambientes de destino.

### A Aplicação (`app.js`)

- Tipo: API REST simples usando `express`.
- Porta padrão: `3000` (controlada pela variável `PORT`).
- Endpoints:
  - `GET /` — Informações básicas e lista de endpoints.
  - `GET /health` — Health check com uptime e ambiente.
  - `GET /version` — Informações da versão e tempo de build.
  - CRUD de usuários em memória via `/api/users` (GET, POST, PUT, DELETE).

Observação: A aplicação armazena dados de usuários em memória (`users`), ou seja, é estateless entre reinícios do container a menos que se adapte para persistência externa.

### `docker-compose.yml` — Serviços Principais

- `gitea`: Servidor Git (Gitea) com persistência em volume `gitea-data`. Expõe a interface web em `3001` (mapeado para 3001:3000 no compose). Também expõe SSH para git (porta 222).
- `gitea-setup`: Container auxiliar para inicializar volumes do Gitea quando necessário.
- `drone-server`: Servidor Drone CI. Comunica-se com o Gitea e oferece interface web em `3002`.
- `drone-runner`: Executor dos pipelines Drone (utiliza Docker para builds). Conecta ao `drone-server` via `DRONE_RPC_SECRET`.
- `registry`: Docker Registry privado (porta `5000`) para armazenar imagens.
- `registry-ui`: Interface web para visualizar imagens do registry (porta `5001`).
- `app`: A nossa aplicação Node.js. É construída usando o `Dockerfile` e expõe `3000`.

Rede: Todos os serviços são conectados à rede `devops-network` com sub-rede definida.

Volumes: São definidos volumes para persistência: `gitea-data`, `drone-data`, `registry-data`.

### `Dockerfile`

- Multi-stage build baseado em `node:18-alpine`.
- Instala apenas dependências de produção via `npm ci --only=production`.
- Cria um usuário `nodejs` não-root para rodar a aplicação.
 - Define `HEALTHCHECK` que testa o endpoint `/health` e usa um pequeno script Node.js/HTTP para validar o status 200.

## Como Executar

Recomenda-se usar Docker e Docker Compose para subir todo o ambiente.

1. Subir o ambiente (modo detached):

```powershell
cd C:\Users\Calian\git-projetos\n2-devops
docker-compose up -d
```

2. Verificar containers rodando:

```powershell
docker-compose ps
```

3. Para ver logs de um serviço específico:

```powershell
docker-compose logs -f app
```

4. Rebuild (quando editar imagens ou Dockerfile):

```powershell
docker-compose up -d --build
```

### Executar Testes Localmente

Para executar a suite completa de testes unitários:

```powershell
# Instalar dependências
npm install

# Executar todos os testes
npm test

# Executar testes com cobertura
npm run test:coverage

# Executar testes em modo watch (desenvolvimento)
npm run test:watch

# Executar testes para CI/CD
npm run test:ci
```

### Estrutura de Testes

O projeto inclui uma suite completa de testes unitários:

- `tests/app.test.js` — Testes principais da API (CRUD, endpoints, validações)
- `tests/health.test.js` — Testes de healthcheck e monitoramento
- `tests/validation.test.js` — Testes de validação e edge cases
- `tests/setup.js` — Configuração global dos testes
- `jest.config.js` — Configuração do Jest

### Cobertura de Testes

O projeto está configurado para gerar relatórios de cobertura com os seguintes limites mínimos:

- **Branches**: 80%
- **Functions**: 80% 
- **Lines**: 80%
- **Statements**: 80%

Os testes incluem:
- ✅ Validação de todos os endpoints da API
- ✅ Testes de CRUD completo (Create, Read, Update, Delete)
- ✅ Healthcheck e monitoramento
- ✅ Validação de entrada e edge cases
- ✅ Testes de concorrência e performance
- ✅ Testes de encoding UTF-8
- ✅ Simulação de ataques de injeção

## 🚀 Guia de Execução Rápida

### Pré-requisitos
- Docker e Docker Compose instalados
- Git instalado
- Node.js 18+ (apenas para desenvolvimento local)

### Opção 1: Execução Completa (Recomendado)

```powershell
# 1. Clonar e navegar
git clone <seu-repo>
cd n2-devops

# 2. Subir ambiente completo
docker-compose up -d

# 3. Verificar status
docker-compose ps

# 4. Aguardar inicialização (2-3 minutos)
docker-compose logs -f
```

### Opção 2: Desenvolvimento Local

```powershell
# 1. Instalar dependências
npm install

# 2. Executar testes
npm test

# 3. Rodar aplicação
npm start

# 4. Ou modo desenvolvimento
npm run dev
```

### Opção 3: Apenas Testes

```powershell
# Testes completos com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch

# Testes para CI/CD
npm run test:ci
```

## 🌐 URLs de Acesso

Após subir o ambiente com `docker-compose up -d`, acesse:

| Serviço | URL | Descrição |
|---------|-----|-------------|
| **API Principal** | http://localhost:3000 | Aplicação Node.js |
| **Health Check** | http://localhost:3000/health | Status da aplicação |
| **Gitea (Git)** | http://localhost:3001 | Servidor Git + Interface |
| **Drone CI** | http://localhost:3002 | Pipeline CI/CD |
| **Docker Registry** | http://localhost:5000 | Repositório de imagens |
| **Registry UI** | http://localhost:5001 | Interface do Registry |

### Credenciais Padrão

**Gitea** (primeira execução):
- Usuário: `admin`
- Senha: `admin123`
- Email: `admin@devops.local`

**Drone CI**:
- Login integrado com Gitea
- Configurar OAuth após setup do Gitea

## Variáveis de Ambiente Importantes

- `NODE_ENV` — Ambiente da aplicação (`production` por padrão no Dockerfile).
- `PORT` — Porta usada pela aplicação (padrão `3000`).
- `DRONE_RPC_SECRET` — Segredo compartilhado entre `drone-server` e `drone-runner`.
- `GITEA__server__ROOT_URL` — URL base configurada para o Gitea.

## Volumes e Persistência

- `gitea-data`: Armazena o banco e configuração do Gitea.
- `drone-data`: Armazena dados do Drone (se necessário).
- `registry-data`: Armazena camadas e metadados do Docker Registry.

Os volumes garantem persistência mesmo após reiniciar ou recriar os containers.

## Healthchecks

O `docker-compose.yml` configura healthchecks, especialmente para a aplicação (`app`) — o Docker considera o container saudável apenas quando o endpoint `/health` responde com `200`.

## API — Exemplos de Uso

Endpoints principais (exemplo com `curl`):

```powershell
# Health
curl http://localhost:3000/health

# Listar usuários
curl http://localhost:3000/api/users

# Criar usuário
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"name":"Teste","email":"teste@example.com"}'
```

## 🔧 Troubleshooting Avançado

### Problemas Comuns

#### Containers não inicializam
```powershell
# Verificar logs detalhados
docker-compose logs [service-name]

# Reiniciar serviço específico
docker-compose restart [service-name]

# Rebuild completo
docker-compose down
docker-compose up --build -d
```

#### Portas em uso
```powershell
# Verificar portas ocupadas
netstat -an | findstr "3000\|3001\|3002\|5000\|5001"

# Parar processos se necessário
docker-compose down
```

#### Testes falhando
```powershell
# Limpar cache do Jest
npm test -- --clearCache

# Executar testes individualmente
npm test -- --testPathPattern=app.test.js

# Debug mode
npm test -- --verbose --detectOpenHandles
```

#### Registry inacessível
```powershell
# Testar conectividade
curl http://localhost:5000/v2/
curl http://localhost:5001/

# Verificar volumes
docker volume ls
docker volume inspect n2-devops_registry-data
```

#### Pipeline Drone não executa
```powershell
# Verificar logs do drone-runner
docker-compose logs drone-runner

# Verificar conectividade de rede
docker network inspect n2-devops_devops-network

# Reset do Drone
docker-compose restart drone-server drone-runner
```

### Comandos Úteis

```powershell
# Monitoramento em tempo real
docker stats
watch "docker-compose ps"

# Limpeza completa
docker-compose down -v
docker system prune -a
docker volume prune

# Backup dos dados
docker-compose exec gitea tar -czf /tmp/gitea-backup.tar.gz -C /data .
docker cp gitea:/tmp/gitea-backup.tar.gz ./backup/

# Verificar saúde dos containers
docker-compose exec app wget --spider --quiet http://localhost:3000/health
docker-compose exec gitea wget --spider --quiet http://localhost:3000
```

### Logs Importantes

```powershell
# Logs da aplicação
docker-compose logs -f app

# Logs do pipeline
docker-compose logs -f drone-server

# Logs do Git
docker-compose logs -f gitea

# Todos os logs
docker-compose logs --tail=100
```

## 🚀 Pipeline CI/CD com Testes

### Fluxo do Pipeline (`.drone.yml`)

1. **Build da Aplicação**: Instala dependências de produção
2. **Testes Unitários**: Executa suite completa com Jest
   - Valida sintaxe do código
   - Executa todos os testes
   - Gera relatório de cobertura
3. **Build Docker**: Cria imagem com multi-stage
4. **Verificação**: Testa imagem no registry
5. **Deploy**: Simula deploy em ambiente
6. **Notificação**: Informa sucesso/falha

### Executar Pipeline Localmente

```powershell
# Simular steps do pipeline
# 1. Build
npm ci --only=production

# 2. Testes
npm ci
npm run test:ci

# 3. Docker build
docker build -t n2-devops-api:test .

# 4. Verificar imagem
docker run --rm -d --name test-app -p 3001:3000 n2-devops-api:test
docker exec test-app wget --spider http://localhost:3000/health
docker stop test-app
```

### Tags de Versionamento

O pipeline gera automaticamente:
- `latest`: Última versão da branch main
- `v1.0.{BUILD_NUMBER}`: Versão sequencial
- `{SHA:8}`: Hash do commit (8 caracteres)

## Sugestões de Melhoria

- Adicionar HTTPS (reverse proxy + certificados).
- Implementar backups automáticos dos volumes de dados.
- Integrar testes automatizados mais robustos no pipeline Drone.
- Monitoramento com Prometheus/Grafana.

## Conclusão

Este projeto fornece um ambiente funcional para demonstrar um fluxo DevOps completo com ferramentas open source. A aplicação de exemplo é simples e serve para validar o pipeline, healthchecks e publicações para um registry privado. O arquivo `docker-compose.yml` é o ponto central para levantar todo o ambiente localmente.

---

Arquivo criado automaticamente: `DOCUMENTATION.md` — revise e ajuste credenciais sensíveis antes de colocar em produção.
