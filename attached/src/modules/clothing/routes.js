const express = require('express');
const router = express.Router();

const {
  getAllClothing,
  getClothingById,
  createClothing,
  updateClothing,
  deleteClothing,
} = require('./controller');

router.get('/', getAllClothing);
router.post('/', createClothing);
router.get('/:id', getClothingById);
router.put('/:id', updateClothing);
router.delete('/:id', deleteClothing);

module.exports = router;
