const request = require('supertest');
const app = require('../app');

describe('API N2 DevOps - Testes Unitários', () => {
  
  // ===============================
  // TESTES DE ENDPOINTS INFORMATIVOS
  // ===============================
  
  describe('GET /', () => {
    it('deve retornar informações básicas da API', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'API N2 DevOps - Funcionando!');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('users', '/api/users');
      expect(response.body.endpoints).toHaveProperty('health', '/health');
      expect(response.body.endpoints).toHaveProperty('version', '/version');
    });

    it('deve retornar timestamp válido', async () => {
      const response = await request(app).get('/');
      const timestamp = new Date(response.body.timestamp);
      
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe('GET /health', () => {
    it('deve retornar status de saúde da aplicação', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /version', () => {
    it('deve retornar informações de versão', async () => {
      const response = await request(app).get('/version');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('buildTime');
      expect(response.body).toHaveProperty('nodeVersion');
      expect(response.body.nodeVersion).toMatch(/^v\d+\.\d+\.\d+/);
    });
  });

  // ===============================
  // TESTES DE CRUD USUÁRIOS
  // ===============================
  
  describe('GET /api/users', () => {
    it('deve listar todos os usuários', async () => {
      const response = await request(app).get('/api/users');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBe(response.body.data.length);
      expect(response.body.count).toBeGreaterThanOrEqual(3); // usuarios iniciais
    });

    it('deve retornar usuários com estrutura correta', async () => {
      const response = await request(app).get('/api/users');
      const users = response.body.data;
      
      users.forEach(user => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(typeof user.id).toBe('number');
        expect(typeof user.name).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });
  });

  describe('GET /api/users/:id', () => {
    it('deve retornar usuário específico por ID', async () => {
      const response = await request(app).get('/api/users/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('name', 'João Silva');
      expect(response.body.data).toHaveProperty('email', 'joao@example.com');
    });

    it('deve retornar 404 para usuário inexistente', async () => {
      const response = await request(app).get('/api/users/9999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Usuário não encontrado');
    });

    it('deve tratar ID inválido', async () => {
      const response = await request(app).get('/api/users/abc');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/users', () => {
    it('deve criar novo usuário com dados válidos', async () => {
      const newUser = {
        name: 'Teste User',
        email: 'teste@example.com'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(newUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Usuário criado com sucesso');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', newUser.name);
      expect(response.body.data).toHaveProperty('email', newUser.email);
      expect(typeof response.body.data.id).toBe('number');
    });

    it('deve rejeitar usuário sem nome', async () => {
      const invalidUser = {
        email: 'teste@example.com'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(invalidUser);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Nome e email são obrigatórios');
    });

    it('deve rejeitar usuário sem email', async () => {
      const invalidUser = {
        name: 'Teste User'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(invalidUser);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Nome e email são obrigatórios');
    });

    it('deve rejeitar dados vazios', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('deve atualizar usuário existente', async () => {
      const updateData = {
        name: 'João Silva Atualizado',
        email: 'joao.novo@example.com'
      };
      
      const response = await request(app)
        .put('/api/users/1')
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Usuário atualizado com sucesso');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name', updateData.name);
      expect(response.body.data).toHaveProperty('email', updateData.email);
    });

    it('deve atualizar apenas nome', async () => {
      const updateData = { name: 'Apenas Nome Novo' };
      
      const response = await request(app)
        .put('/api/users/2')
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', updateData.name);
      expect(response.body.data).toHaveProperty('email', 'maria@example.com'); // email original
    });

    it('deve atualizar apenas email', async () => {
      const updateData = { email: 'email.novo@example.com' };
      
      const response = await request(app)
        .put('/api/users/3')
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', updateData.email);
      expect(response.body.data).toHaveProperty('name', 'Pedro Oliveira'); // nome original
    });

    it('deve retornar 404 para usuário inexistente', async () => {
      const updateData = { name: 'Novo Nome' };
      
      const response = await request(app)
        .put('/api/users/9999')
        .send(updateData);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Usuário não encontrado');
    });
  });

  describe('DELETE /api/users/:id', () => {
    let testUserId;
    
    beforeEach(async () => {
      // Criar usuário para teste de exclusão
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          name: 'Usuario Para Deletar',
          email: 'delete@example.com'
        });
      testUserId = createResponse.body.data.id;
    });

    it('deve deletar usuário existente', async () => {
      const response = await request(app).delete(`/api/users/${testUserId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Usuário deletado com sucesso');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testUserId);
      
      // Verificar se foi realmente removido
      const getResponse = await request(app).get(`/api/users/${testUserId}`);
      expect(getResponse.status).toBe(404);
    });

    it('deve retornar 404 para usuário inexistente', async () => {
      const response = await request(app).delete('/api/users/9999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Usuário não encontrado');
    });
  });

  // ===============================
  // TESTES DE ROTAS INEXISTENTES
  // ===============================
  
  describe('Rota 404', () => {
    it('deve retornar 404 para rota inexistente', async () => {
      const response = await request(app).get('/rota-inexistente');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Rota não encontrada');
    });

    it('deve retornar 404 para POST em rota inexistente', async () => {
      const response = await request(app).post('/rota-inexistente');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  // ===============================
  // TESTES DE HEADERS E CORS
  // ===============================
  
  describe('CORS e Headers', () => {
    it('deve incluir headers CORS', async () => {
      const response = await request(app).get('/');
      
      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    it('deve aceitar JSON no Content-Type', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          name: 'Test JSON',
          email: 'json@example.com'
        });
      
      expect(response.status).toBe(201);
    });
  });

  // ===============================
  // TESTES DE INTEGRAÇÃO BÁSICOS
  // ===============================
  
  describe('Fluxo Completo CRUD', () => {
    it('deve realizar fluxo completo: criar, ler, atualizar, deletar', async () => {
      // Criar
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          name: 'Fluxo Completo',
          email: 'fluxo@example.com'
        });
      expect(createResponse.status).toBe(201);
      const userId = createResponse.body.data.id;

      // Ler
      const readResponse = await request(app).get(`/api/users/${userId}`);
      expect(readResponse.status).toBe(200);
      expect(readResponse.body.data.name).toBe('Fluxo Completo');

      // Atualizar
      const updateResponse = await request(app)
        .put(`/api/users/${userId}`)
        .send({
          name: 'Fluxo Atualizado',
          email: 'atualizado@example.com'
        });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.name).toBe('Fluxo Atualizado');

      // Deletar
      const deleteResponse = await request(app).delete(`/api/users/${userId}`);
      expect(deleteResponse.status).toBe(200);

      // Verificar exclusão
      const verifyResponse = await request(app).get(`/api/users/${userId}`);
      expect(verifyResponse.status).toBe(404);
    });
  });
});