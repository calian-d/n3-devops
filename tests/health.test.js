const request = require('supertest');
const app = require('../app');

describe('Testes de Healthcheck e Monitoramento', () => {
  
  describe('Health Endpoint Avançado', () => {
    it('deve retornar uptime válido', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('deve retornar timestamp no formato ISO', async () => {
      const response = await request(app).get('/health');
      
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      const timestamp = new Date(response.body.timestamp);
      const now = new Date();
      const diff = Math.abs(now.getTime() - timestamp.getTime());
      
      // Timestamp deve ser recente (menos de 5 segundos)
      expect(diff).toBeLessThan(5000);
    });

    it('deve incluir informações de ambiente', async () => {
      const response = await request(app).get('/health');
      
      expect(response.body).toHaveProperty('environment');
      expect(['development', 'production', 'test']).toContain(
        response.body.environment || 'development'
      );
    });
  });

  describe('Version Endpoint Avançado', () => {
    it('deve retornar versão Node.js válida', async () => {
      const response = await request(app).get('/version');
      
      expect(response.body.nodeVersion).toMatch(/^v\d+\.\d+\.\d+/);
      expect(response.body.nodeVersion).toBe(process.version);
    });

    it('deve retornar buildTime no formato correto', async () => {
      const response = await request(app).get('/version');
      
      const buildTime = new Date(response.body.buildTime);
      expect(buildTime).toBeInstanceOf(Date);
      expect(buildTime.getTime()).not.toBeNaN();
    });
  });

  describe('Status de Resposta Consistente', () => {
    const endpoints = [
      '/',
      '/health', 
      '/version',
      '/api/users'
    ];

    endpoints.forEach(endpoint => {
      it(`deve retornar Content-Type JSON para ${endpoint}`, async () => {
        const response = await request(app).get(endpoint);
        
        expect(response.headers['content-type']).toMatch(/application\/json/);
      });

      it(`deve ter response time aceitável para ${endpoint}`, async () => {
        const start = Date.now();
        const response = await request(app).get(endpoint);
        const responseTime = Date.now() - start;
        
        expect(response.status).toBeLessThan(500);
        expect(responseTime).toBeLessThan(1000); // Menos de 1 segundo
      });
    });
  });

  describe('Testes de Load Básico', () => {
    it('deve suportar múltiplas requisições simultâneas', async () => {
      const promises = Array(10).fill().map(() => 
        request(app).get('/health')
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'OK');
      });
    });

    it('deve manter consistência de dados em requisições paralelas', async () => {
      const getUsersPromises = Array(5).fill().map(() =>
        request(app).get('/api/users')
      );
      
      const responses = await Promise.all(getUsersPromises);
      const firstCount = responses[0].body.count;
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.count).toBe(firstCount);
      });
    });
  });
});