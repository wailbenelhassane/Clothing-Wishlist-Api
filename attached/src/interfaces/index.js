const env = require('../config/env');

// Determinar backend a usar: puede ser por variable de entorno o configuración.
// En este caso, por defecto usamos DynamoDB.

let ClothingRepository;

const DynamoDBClothingRepository = require('./implementations/dynamoDBClothingRepository');

console.log(`Using ClothingRepository implementation: DynamoDB`);
ClothingRepository = new DynamoDBClothingRepository();

module.exports = ClothingRepository;
