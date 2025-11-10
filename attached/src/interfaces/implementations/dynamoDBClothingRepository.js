const { v4: uuidv4 } = require('uuid');
const ClothingRepository = require('../repositories/clothingRepository');

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const env = require('../../config/env');
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
  GetCommand
} = require('@aws-sdk/lib-dynamodb');

// Resolve table name from multiple possible envs/configs to avoid drift
const TABLE_NAME =
  process.env.CLOTHING_TABLE ||
  process.env.DYNAMODB_TABLE ||
  process.env.DB_DYNAMONAME ||
  (env && env.dynamo && env.dynamo.table) ||
  'clothing_items';

// Configurar cliente: soporta DYNAMODB_ENDPOINT para localstack/dynamodb-local
const ddbClient = new DynamoDBClient({
  region:
    process.env.DYNAMODB_REGION ||
    process.env.AWS_REGION ||
    (env && env.dynamo && env.dynamo.region) ||
    'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
});

const docClient = DynamoDBDocumentClient.from(ddbClient);

class DynamoDBClothingRepository extends ClothingRepository {
  async create(itemData) {
    const { name, brand, size, color, price, wishlist = false, notes = '' } = itemData;
    const item = {
      id: uuidv4(),
      name,
      brand,
      size,
      color,
      price,
      wishlist,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const params = {
      TableName: TABLE_NAME,
      Item: item
      // Puedes añadir ConditionExpression: 'attribute_not_exists(id)' para evitar sobrescrituras accidentales
    };

    try {
      await docClient.send(new PutCommand(params));
      return item;
    } catch (err) {
      err.message = `Error creating clothing item: ${err.message}`;
      throw err;
    }
  }

  async findAll({ limitPerPage = 100 } = {}) {
    const allItems = [];
    let ExclusiveStartKey = undefined;

    try {
      do {
        const params = {
          TableName: TABLE_NAME,
          Limit: limitPerPage,
          ExclusiveStartKey
        };
        const result = await docClient.send(new ScanCommand(params));
        if (result.Items && result.Items.length) {
          allItems.push(...result.Items);
        }
        ExclusiveStartKey = result.LastEvaluatedKey;
      } while (ExclusiveStartKey);

      return allItems;
    } catch (err) {
      err.message = `Error scanning clothing table: ${err.message}`;
      throw err;
    }
  }

  async findById(id) {
    if (!id) return null;
    try {
      const params = { TableName: TABLE_NAME, Key: { id } };
      const result = await docClient.send(new GetCommand(params));
      return result.Item || null;
    } catch (err) {
      err.message = `Error getting clothing item by id: ${err.message}`;
      throw err;
    }
  }

  async delete(id) {
    if (!id) throw new Error('id is required to delete a clothing item');
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      ReturnValues: 'ALL_OLD'
    };
    try {
      const result = await docClient.send(new DeleteCommand(params));
      return result.Attributes || null;
    } catch (err) {
      err.message = `Error deleting clothing item with id ${id}: ${err.message}`;
      throw err;
    }
  }

  async update(id, itemData) {
    if (!id) throw new Error('id is required to update a clothing item');
    const allowedFields = ['name', 'brand', 'size', 'color', 'price', 'wishlist', 'notes'];
    const fields = Object.keys(itemData).filter(
      (k) => allowedFields.includes(k) && itemData[k] !== undefined
    );

    if (fields.length === 0) {
      throw new Error('No valid fields provided for update');
    }

    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = { ':updatedAt': new Date().toISOString() };
    const setParts = [];

    fields.forEach((field, idx) => {
      const nameKey = `#f${idx}`;
      const valKey = `:v${idx}`;
      ExpressionAttributeNames[nameKey] = field;
      ExpressionAttributeValues[valKey] = itemData[field];
      setParts.push(`${nameKey} = ${valKey}`);
    });

    ExpressionAttributeNames['#updatedAt'] = 'updatedAt';
    setParts.push('#updatedAt = :updatedAt');

    const UpdateExpression = 'SET ' + setParts.join(', ');

    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    try {
      const result = await docClient.send(new UpdateCommand(params));
      return result.Attributes;
    } catch (err) {
      err.message = `Error updating clothing item with id ${id}: ${err.message}`;
      throw err;
    }
  }
}

module.exports = DynamoDBClothingRepository;
