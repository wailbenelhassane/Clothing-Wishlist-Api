function validateClothingPayload(payload, requireAllFields = true) {
  const { name, brand, size, color, price } = payload || {};
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

  if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
    return { valid: false, message: 'Invalid price value' };
  }

  return { valid: true };
}

module.exports = { validateClothingPayload };

