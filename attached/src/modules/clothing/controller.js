// Controller consistente usando `id` como clave primaria
// Asume repositorio con métodos:
//   findAll(), findById(id), create(data), update(id, data), delete(id)

const ClothingRepository = require('../../interfaces');

// Validación simple del payload de prenda de ropa
const validateClothingPayload = (payload, requireAllFields = true) => {
  const { name, brand, size, color, price, wishlist, notes } = payload || {};
  const missing = [];

  if (requireAllFields) {
    if (!name) missing.push('name');
    if (!brand) missing.push('brand');
    if (!size) missing.push('size');
    if (!color) missing.push('color');
    if (price === undefined || price === null) missing.push('price');
  }

  if (missing.length) {
    return { valid: false, message: `Missing required fields: ${missing.join(', ')}` };
  }

  if (price !== undefined && price !== null) {
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return { valid: false, message: 'Invalid value for price' };
    }
  }

  if (wishlist !== undefined && typeof wishlist !== 'boolean') {
    return { valid: false, message: 'wishlist must be a boolean' };
  }

  return { valid: true };
};

// GET /clothing
const getAllClothing = async (req, res) => {
  try {
    const items = await ClothingRepository.findAll();
    return res.status(200).json({
      success: true,
      data: items,
      count: Array.isArray(items) ? items.length : undefined,
    });
  } catch (error) {
    console.error('Error fetching clothing items:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// GET /clothing/:id
const getClothingById = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ success: false, error: 'id parameter is required' });

  try {
    const item = await ClothingRepository.findById(id);
    if (!item) return res.status(404).json({ success: false, error: 'Clothing item not found' });
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error(`Error fetching clothing item by id (${id}):`, error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// POST /clothing
const createClothing = async (req, res) => {
  const payload = req.body;
  const validation = validateClothingPayload(payload, true);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.message });
  }

  console.log('Creating clothing item with payload:', payload);
  try {
    const newItem = await ClothingRepository.create(payload);
    return res
      .status(201)
      .json({ success: true, data: newItem, message: 'Clothing item created successfully' });
  } catch (error) {
    console.error('Error creating clothing item:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// PUT /clothing/:id
const updateClothing = async (req, res) => {
  const id = req.params.id;
  const payload = req.body;

  if (!id) return res.status(400).json({ success: false, error: 'id parameter is required' });

  // Verificar que haya campos para actualizar
  const updatableFields = ['name', 'brand', 'size', 'color', 'price', 'wishlist', 'notes'];
  const hasUpdate = Object.keys(payload || {}).some((k) => updatableFields.includes(k));
  if (!hasUpdate) {
    return res.status(400).json({ success: false, error: 'No data to update' });
  }

  const validation = validateClothingPayload(payload, false);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.message });
  }

  try {
    const existing = await ClothingRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Clothing item not found' });
    }

    const updated = await ClothingRepository.update(id, payload);
    return res
      .status(200)
      .json({ success: true, data: updated, message: 'Clothing item updated successfully' });
  } catch (error) {
    console.error(`Error updating clothing item (${id}):`, error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// DELETE /clothing/:id
const deleteClothing = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ success: false, error: 'id parameter is required' });

  try {
    const existing = await ClothingRepository.findById(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Clothing item not found' });

    let deleted = null;
    if (typeof ClothingRepository.delete === 'function') {
      deleted = await ClothingRepository.delete(id);
    } else if (typeof ClothingRepository.deleteById === 'function') {
      deleted = await ClothingRepository.deleteById(id);
    } else {
      await ClothingRepository.delete(id);
    }

    return res
      .status(200)
      .json({ success: true, data: deleted || existing, message: 'Clothing item deleted successfully' });
  } catch (error) {
    console.error(`Error deleting clothing item (${id}):`, error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllClothing,
  getClothingById,
  createClothing,
  updateClothing,
  deleteClothing,
};
