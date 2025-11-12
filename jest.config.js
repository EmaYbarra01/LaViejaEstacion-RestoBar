module.exports = {
  // Entorno de pruebas
  testEnvironment: 'node',

  // Transformaciones para archivos
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.test.js' }]
  },

  // Patrón de archivos de test
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // Archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/database/dbConnection.js',
    '!src/config/**'
  ],

  // Directorio para reportes de cobertura
  coverageDirectory: 'coverage',

  // Reportes de cobertura
  coverageReporters: ['text', 'lcov', 'html'],

  // Umbral de cobertura mínima
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // Timeout para tests
  testTimeout: 10000,

  // Variables de entorno para tests
  setupFiles: ['<rootDir>/tests/setup.js'],

  // Limpiar mocks automáticamente
  clearMocks: true,

  // Modo verbose para más información
  verbose: true
};
