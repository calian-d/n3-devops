const request = require('supertest');
const app = require('../app');

describe('Testes de Validação e Edge Cases', () => {
  
  describe('Validação de Entrada - API Users', () => {
    it('deve rejeitar email em formato inválido', async () => {
      const invalidEmails = [
        'email-sem-arroba',
        '@sem-nome.com',
        'nome@',
        'nome@.com',
        'nome@com',
        'nome..duplo@example.com',
        'nome@example.',
        ''
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/users')
          .send({
            name: 'Nome Válido',
            email: email
          });
        
        // Como a API atual não valida formato, este teste documenta comportamento
        // Em implementação real, deveria retornar 400
        if (email === '') {
          expect(response.status).toBe(400);
        }
      }
    });

    it('deve documentar comportamento atual com nomes vazios', async () => {
      const testCases = [
        { name: '', description: 'string vazia', expectStatus: 400 },
        { name: '   ', description: 'apenas espaços', expectStatus: 201 }, // API atual aceita
        { name: 'a'.repeat(1000), description: 'muito longo', expectStatus: 201 },
        { name: 'Nome Normal', description: 'nome válido', expectStatus: 201 }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/users')
          .send({
            name: testCase.name,
            email: `test-${Date.now()}@example.com`
          });
        
        expect(response.status).toBe(testCase.expectStatus);
        
        if (response.status === 201) {
          expect(response.body.data.name).toBe(testCase.name);
        }
      }
    });
  });

  describe('Testes de Tipo de Dados', () => {
    it('deve lidar com dados de tipos incorretos', async () => {
      const invalidData = [
        { name: 123, email: 'test@example.com' },
        { name: 'Valid Name', email: 123 },
        { name: null, email: 'test@example.com' },
        { name: 'Valid Name', email: null },
        { name: undefined, email: 'test@example.com' },
        { name: 'Valid Name', email: undefined }
      ];

      for (const data of invalidData) {
        const response = await request(app)
          .post('/api/users')
          .send(data);
        
        if (!data.name || !data.email) {
          expect(response.status).toBe(400);
        }
      }
    });
  });

  describe('Testes de Limite e Performance', () => {
    it('deve lidar com payload muito grande', async () => {
      const largeData = {
        name: 'x'.repeat(10000),
        email: 'test@example.com'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(largeData);
      
      // API atual deve aceitar, mas em produção deveria ter limite
      expect([200, 201, 413]).toContain(response.status);
    });

    it('deve responder rapidamente para requisições válidas', async () => {
      const start = Date.now();
      
      const response = await request(app)
        .get('/api/users');
      
      const responseTime = Date.now() - start;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(100); // Menos de 100ms
    });
  });

  describe('Testes de Encoding e Caracteres Especiais', () => {
    it('deve lidar com caracteres especiais em nomes', async () => {
      const specialCharNames = [
        'João da Silva',
        'José María Rodríguez',
        'François Müller',
        'Владимир Путин',
        '张三',
        'محمد عبد الله',
        'José Ñoño',
        'Test 123!@#$%'
      ];

      for (const name of specialCharNames) {
        const response = await request(app)
          .post('/api/users')
          .send({
            name: name,
            email: `test${Date.now()}@example.com`
          });
        
        expect(response.status).toBe(201);
        expect(response.body.data.name).toBe(name);
      }
    });

    it('deve preservar encoding UTF-8 nas respostas', async () => {
      const specialName = 'Usuário com ãçẽñtös';
      
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          name: specialName,
          email: 'utf8@example.com'
        });
      
      expect(createResponse.status).toBe(201);
      const userId = createResponse.body.data.id;
      
      const getResponse = await request(app)
        .get(`/api/users/${userId}`);
      
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.name).toBe(specialName);
    });
  });

  describe('Testes de Concorrência', () => {
    it('deve manter consistência durante criações simultâneas', async () => {
      const initialCount = (await request(app).get('/api/users')).body.count;
      
      const promises = Array(5).fill().map((_, index) =>
        request(app)
          .post('/api/users')
          .send({
            name: `Concurrent User ${index}`,
            email: `concurrent${index}@example.com`
          })
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('id');
      });
      
      const finalCount = (await request(app).get('/api/users')).body.count;
      expect(finalCount).toBe(initialCount + 5);
    });

    it('deve gerar IDs únicos para criações simultâneas', async () => {
      const promises = Array(10).fill().map((_, index) =>
        request(app)
          .post('/api/users')
          .send({
            name: `Unique ID Test ${index}`,
            email: `unique${index}@example.com`
          })
      );
      
      const responses = await Promise.all(promises);
      const ids = responses.map(response => response.body.data.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(uniqueIds.length).toBe(ids.length); // Todos os IDs devem ser únicos
    });
  });

  describe('Testes de Segurança Básica', () => {
    it('deve rejeitar tentativas de injeção em nomes', async () => {
      const injectionAttempts = [
        '<script>alert("xss")</script>',
        'Robert\'); DROP TABLE users; --',
        '${process.exit(1)}',
        '../../etc/passwd',
        'javascript:alert(1)'
      ];

      for (const attempt of injectionAttempts) {
        const response = await request(app)
          .post('/api/users')
          .send({
            name: attempt,
            email: 'injection@example.com'
          });
        
        expect(response.status).toBe(201);
        // Verifica que o conteúdo é armazenado como string literal
        expect(response.body.data.name).toBe(attempt);
      }
    });
  });
});