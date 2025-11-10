// Dispatcher: selecciona el handler según process.env.HANDLER_NAME
// Cada handler exporta: exports.handler = async (event, context) => {...}

const create = require('./modules/clothing/handlers/create');
const list = require('./modules/clothing/handlers/list');
const get = require('./modules/clothing/handlers/get');
const update = require('./modules/clothing/handlers/update');
const del = require('./modules/clothing/handlers/delete');
const options = require('./modules/clothing/handlers/options');

// Determinar handler a ejecutar
const which = (process.env.HANDLER_NAME || process.env.AWS_LAMBDA_FUNCTION_NAME || 'get').toLowerCase();

// CORS headers - coherentes con la configuración API Gateway
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Requested-With, Authorization, x-api-key',
  'Access-Control-Expose-Headers': 'Content-Length, X-Request-Id',
  'Content-Type': 'application/json'
};

module.exports.handler = async (event, context) => {
  // Preflight OPTIONS
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return options.handler(event, context);
  }

  switch (which) {
    case 'create':
    case 'createclothing':
    case 'addclothing':
      return create.handler(event, context);

    case 'list':
    case 'getall':
    case 'getallclothing':
      return list.handler(event, context);

    case 'get':
    case 'getitem':
    case 'getclothing':
      return get.handler(event, context);

    case 'update':
    case 'updateclothing':
      return update.handler(event, context);

    case 'delete':
    case 'remove':
    case 'deleteclothing':
      return del.handler(event, context);

    case 'options':
      return options.handler(event, context);

    default:
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: `Unknown handler ${which}` })
      };
  }
};
