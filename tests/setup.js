// Setup global para todos os testes

// Configurações globais
global.console = {
  ...console,
  // Silenciar logs durante testes (opcional)
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Setup executado antes de cada arquivo de teste
beforeAll(async () => {
  // Aguardar aplicação inicializar
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Cleanup após cada arquivo de teste
afterAll(async () => {
  // Fechar conexões se necessário
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Configurações para cada teste individual
beforeEach(() => {
  // Reset do estado entre testes
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup após cada teste
  jest.restoreAllMocks();
});