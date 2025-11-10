// Configuraci�n centralizada de la aplicaci�n clothing-app
// Sencilla, robusta y con soporte para overrides vía variables de entorno.

const env = require('./env');

const toInt = (v, fallback) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : fallback;
};

// CORS: en producción es recomendable evitar '*' y definir dominios concretos.
const defaultCorsOrigin = '*';
const corsOrigin = process.env.CORS_ORIGIN || defaultCorsOrigin;

module.exports = {
  // Servidor
  port: env.port,
  host: process.env.HOST || '0.0.0.0',

  // Configuración CORS
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'X-Requested-With',
      'Authorization',
      'x-api-key',
    ],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Body parser: tamaño máximo razonable para payloads JSON/URL-encoded
  bodyParser: {
    json: { limit: '5mb', strict: true },
    urlencoded: { limit: '5mb', extended: true },
  },

  // Timeouts
  timeout: toInt(process.env.SERVER_TIMEOUT_MS, 30000),
  keepAliveTimeout: toInt(process.env.SERVER_KEEPALIVE_MS, 65000),

  // Respuesta de error (con stack trace en desarrollo)
  response: {
    error: {
      includeStack: env.nodeEnv !== 'production',
    },
  },

  // Flags de entorno
  env: env.nodeEnv,
  isDevelopment: env.nodeEnv === 'development',
  isProduction: env.nodeEnv === 'production',
  isTest: env.nodeEnv === 'test',
};
