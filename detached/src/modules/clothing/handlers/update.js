const DynamoDBClothingRepository = require('../repository');
const { validateClothingPayload } = require('../validation');
const repo = new DynamoDBClothingRepository();

const headers = { 
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Requested-With, Authorization, x-api-key',
  'Access-Control-Expose-Headers': 'Content-Length, X-Request-Id'
};

exports.handler = async (event) => {
  const id = event.pathParameters && event.pathParameters.id;
  if (!id) {
    return { 
      statusCode: 400, 
      headers, 
      body: JSON.stringify({ success: false, error: 'id parameter is required' }) 
    };
  }

  let payload;
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    return { 
      statusCode: 400, 
      headers, 
      body: JSON.stringify({ success: false, error: 'Invalid JSON body' }) 
    };
  }

  const updatableFields = ['name', 'brand', 'size', 'color', 'price', 'wishlist', 'notes'];
  const hasUpdate = Object.keys(payload || {}).some(k => updatableFields.includes(k));

  if (!hasUpdate) {
    return { 
      statusCode: 400, 
      headers, 
      body: JSON.stringify({ success: false, error: 'No data to update' }) 
    };
  }

  const validation = validateClothingPayload(payload, false);
  if (!validation.valid) {
    return { 
      statusCode: 400, 
      headers, 
      body: JSON.stringify({ success: false, error: validation.message }) 
    };
  }

  try {
    const existing = await repo.findById(id);
    if (!existing) {
      return { 
        statusCode: 404, 
        headers, 
        body: JSON.stringify({ success: false, error: 'Clothing item not found' }) 
      };
    }

    const updated = await repo.update(id, payload);
    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ success: true, data: updated, message: 'Clothing item updated successfully' }) 
    };
  } catch (err) {
    console.error(`Error updating clothing item (${id}):`, err);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ success: false, error: 'Internal Server Error' }) 
    };
  }
};

