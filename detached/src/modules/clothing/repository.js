const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
  GetCommand
} = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.CLOTHING_TABLE || 'clothing_items';

const ddbClient = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION || process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined
});

const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true
  }
});

class DynamoDBClothingRepository {
  async create(itemData) {
    const cleanData = {};
    Object.entries(itemData || {}).forEach(([key, val]) => {
      if (val === '' || val === undefined) return;
      if (key === 'price') {
        const num = typeof val === 'number' ? val : Number(val);
        if (Number.isFinite(num) && num >= 0) cleanData.price = num;
        return;
      }
      if (key === 'wishlist') {
        cleanData.wishlist = typeof val === 'boolean' ? val : (String(val).toLowerCase() === 'true' || String(val) === '1');
        return;
      }
      cleanData[key] = val;
    });

    const item = {
      id: uuidv4(),
      ...cleanData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return item;
  }

  async findAll({ limitPerPage = 100 } = {}) {
    const allItems = [];
    let ExclusiveStartKey;

    do {
      const result = await docClient.send(
        new ScanCommand({ TableName: TABLE_NAME, Limit: limitPerPage, ExclusiveStartKey })
      );
      if (result.Items?.length) allItems.push(...result.Items);
      ExclusiveStartKey = result.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    return allItems;
  }

  async findById(id) {
    const result = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { id } }));
    return result.Item || null;
  }

  async delete(id) {
    const result = await docClient.send(
      new DeleteCommand({ TableName: TABLE_NAME, Key: { id }, ReturnValues: 'ALL_OLD' })
    );
    return result.Attributes || null;
  }

  async update(id, data) {
    const allowed = ['name', 'brand', 'size', 'color', 'price', 'wishlist', 'notes', 'link', 'reference'];
    const cleanData = {};
    for (const field of Object.keys(data || {})) {
      if (!allowed.includes(field)) continue;
      const val = data[field];
      if (val === '' || val === undefined) continue;
      if (field === 'price') {
        const num = typeof val === 'number' ? val : Number(val);
        if (!Number.isFinite(num) || num < 0) continue;
        cleanData.price = num;
      } else if (field === 'wishlist') {
        cleanData.wishlist = typeof val === 'boolean' ? val : (String(val).toLowerCase() === 'true' || String(val) === '1');
      } else {
        cleanData[field] = val;
      }
    }

    const fields = Object.keys(cleanData);
    if (fields.length === 0) throw new Error('No valid fields for update');

    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = { ':updatedAt': new Date().toISOString() };
    const updates = [];

    fields.forEach((field) => {
      ExpressionAttributeNames[`#${field}`] = field;
      ExpressionAttributeValues[`:${field}`] = cleanData[field];
      updates.push(`#${field} = :${field}`);
    });

    ExpressionAttributeNames['#updatedAt'] = 'updatedAt';
    updates.push('#updatedAt = :updatedAt');

    const UpdateExpression = `SET ${updates.join(', ')}`;

    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      })
    );

    return result.Attributes;
  }
}

module.exports = DynamoDBClothingRepository;

