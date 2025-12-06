# 🚀 Guia de Execução - Projeto N2 DevOps

## ⚡ Início Rápido (2 minutos)

```powershell
# 1. Navegar para o projeto
cd C:\Users\Calian\git-projetos\n2-devops

# 2. Subir ambiente completo
docker-compose up -d

# 3. Aguardar inicialização (2-3 min)
docker-compose logs -f

# 4. Verificar se está funcionando
curl http://localhost:3000/health
```

## 🎯 Acessos Rápidos

| Serviço | URL | Status |
|---------|-----|---------|
| **API** | http://localhost:3000 | ✅ Funcionando |
| **Gitea** | http://localhost:3001 | ✅ Funcionando |
| **Drone CI** | http://localhost:3002 | ✅ Funcionando |
| **Registry UI** | http://localhost:5001 | ✅ Funcionando |

## 🧪 Executar Testes

```powershell
# Instalar dependências
npm install

# Rodar todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# Ver relatório no navegador
start coverage/lcov-report/index.html
```

## 🔧 Comandos Essenciais

### Gerenciar Containers
```powershell
# Ver status
docker-compose ps

# Parar tudo
docker-compose down

# Rebuild
docker-compose up --build -d

# Ver logs
docker-compose logs -f [service-name]
```

### Desenvolvimento
```powershell
# Rodar app local
npm start

# Modo desenvolvimento
npm run dev

# Testar API
curl http://localhost:3000/api/users
```

### Limpeza
```powershell
# Limpar containers e volumes
docker-compose down -v
docker system prune -a
```

## 🐛 Troubleshooting Rápido

### Container não sobe?
```powershell
docker-compose logs [service-name]
docker-compose restart [service-name]
```

### Porta ocupada?
```powershell
netstat -an | findstr "3000"
docker-compose down
```

### Testes falhando?
```powershell
npm test -- --clearCache
npm test -- --verbose
```

### Registry não funciona?
```powershell
curl http://localhost:5000/v2/
curl http://localhost:5001/
```

## 📊 Verificações

### ✅ Checklist de Funcionamento

- [ ] Containers rodando: `docker-compose ps`
- [ ] API respondendo: `curl http://localhost:3000/health`
- [ ] Gitea acessível: `curl http://localhost:3001`
- [ ] Drone ativo: `curl http://localhost:3002`
- [ ] Registry funcionando: `curl http://localhost:5000/v2/`
- [ ] Testes passando: `npm test`

### 📈 Monitoramento

```powershell
# Status em tempo real
watch "docker-compose ps"

# Uso de recursos
docker stats

# Logs em tempo real
docker-compose logs -f
```

## 🎬 Demo Completa

### 1. Configurar Gitea (primeira vez)
1. Acesse: http://localhost:3001
2. Configure instalação inicial
3. Crie usuário admin: `admin/admin123`

### 2. Integrar Drone
1. Acesse: http://localhost:3002
2. Login com Gitea
3. Ativar repositório
4. Push código → pipeline executa automaticamente

### 3. Testar API
```powershell
# Health check
curl http://localhost:3000/health

# Listar usuários
curl http://localhost:3000/api/users

# Criar usuário
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d "{\"name\":\"Teste\",\"email\":\"teste@example.com\"}"
```

### 4. Verificar Registry
1. Acesse: http://localhost:5001
2. Veja imagens criadas pelo pipeline
3. Verifique tags de versionamento

## 🎉 Pronto!

Agora você tem um ambiente DevOps completo funcionando com:
- ✅ Git server (Gitea)
- ✅ CI/CD (Drone)
- ✅ Registry (Docker)
- ✅ Aplicação testada (Node.js)
- ✅ Testes automatizados (Jest)

---

**Dúvidas?** Consulte `DOCUMENTATION.md` para informações detalhadas.