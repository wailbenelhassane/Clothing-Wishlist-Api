const express = require('express');
const cors = require('cors');

const serverConfig = require('./config/server');
const clothingRoutes = require('./modules/clothing/routes');

const app = express();

// Middlewares
app.use(cors(serverConfig.cors || {}));
app.use(
  express.json(
    serverConfig.bodyParser && serverConfig.bodyParser.json
      ? serverConfig.bodyParser.json
      : {}
  )
);
app.use(
  express.urlencoded(
    serverConfig.bodyParser && serverConfig.bodyParser.urlencoded
      ? serverConfig.bodyParser.urlencoded
      : { extended: true }
  )
);

// Rutas principales
app.use('/clothing', clothingRoutes);

// Endpoint de salud
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Clothing API is running',
    environment: serverConfig.env || process.env.NODE_ENV,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(serverConfig.response &&
    serverConfig.response.error &&
    serverConfig.response.error.includeStack
      ? { stack: err.stack }
      : {}),
  });
});

// Iniciar servidor
const port = serverConfig.port || process.env.PORT || 3000;
const host = serverConfig.host || '0.0.0.0';
const server = app.listen(port, host, () => {
  console.log(`dYs? Clothing API running on http://${host}:${port}`);
});

// Graceful shutdown
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
  console.log('dY>` Shutting down...');
  server.close(() => {
    console.log('�o. Server closed gracefully');
    process.exit(0);
  });

  // fallback si no se cierra correctamente
  setTimeout(() => process.exit(1), 10000);
}

module.exports = app;
