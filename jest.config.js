module.exports = {
  // Ambiente de testes
  testEnvironment: 'node',
  
  // Padrão de arquivos de teste
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.js'
  ],
  
  // Arquivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/data/',
    '/logs/',
    '/config/'
  ],
  
  // Configuração de cobertura
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],
  
  // Arquivos para análise de cobertura
  collectCoverageFrom: [
    '*.js',
    '!node_modules/**',
    '!coverage/**',
    '!jest.config.js',
    '!tests/**',
    '!data/**',
    '!logs/**',
    '!config/**'
  ],
  
  // Limites de cobertura
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Setup de testes
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Timeout para testes
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Detectar testes abertos
  detectOpenHandles: true,
  
  // Forçar saída após testes
  forceExit: true,
  
  // Configurações de módulos
  moduleFileExtensions: ['js', 'json'],
  
  // Transformações (se necessário)
  transform: {},
  
  // Mock de módulos globais
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};