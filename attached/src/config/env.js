// src/config/env.js
// Centraliza la lectura de variables de entorno para la app clothing-app (wishlist de prendas)

const toInt = (v, fallback) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : fallback;
};

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT || process.env.APP_PORT, 8080),

  dynamo: {
    endpoint: process.env.DYNAMODB_ENDPOINT,
    region: process.env.DYNAMODB_REGION || 'us-east-1',
    // Permitimos sobreescribir por variable de entorno, con fallback coherente
    table:
      process.env.DYNAMODB_TABLE ||
      process.env.CLOTHING_TABLE ||
      'clothing_items',
  },
};
