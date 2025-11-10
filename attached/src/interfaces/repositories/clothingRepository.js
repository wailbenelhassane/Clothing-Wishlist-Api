/**
 * Interfaz/base class para repositorios de prendas de ropa.
 * Implementaciones concretas (DynamoDB, SQL, etc.) deben extender esta clase
 * y sobrescribir los métodos. Todos los métodos son de instancia.
 */
class ClothingRepository {
  /**
   * Obtener todas las prendas de ropa.
   * @returns {Promise<Array<Object>>}
   */
  async findAll() {
    throw new Error('findAll() not implemented');
  }

  /**
   * Obtener una prenda por su id (clave primaria).
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('findById(id) not implemented');
  }

  /**
   * Crear una nueva prenda de ropa.
   * @param {Object} clothingData
   * @returns {Promise<Object>} - el registro creado
   */
  async create(clothingData) {
    throw new Error('create(clothingData) not implemented');
  }

  /**
   * Actualizar una prenda existente por id.
   * @param {string} id
   * @param {Object} clothingData
   * @returns {Promise<Object|null>} - el registro actualizado
   */
  async update(id, clothingData) {
    throw new Error('update(id, clothingData) not implemented');
  }

  /**
   * Eliminar una prenda por id.
   * @param {string} id
   * @returns {Promise<Object|null>} - el registro eliminado (si procede)
   */
  async delete(id) {
    throw new Error('delete(id) not implemented');
  }
}

module.exports = ClothingRepository;
