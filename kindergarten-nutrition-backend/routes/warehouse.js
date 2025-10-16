import express from 'express';
import { getAllWarehouse,
  getWarehouseById,
  addWarehouseItem,
  deleteWarehouseItem } from '../controllers/WarehouseController.js';

const router = express.Router();

router.get('/', getAllWarehouse);
router.get('/:id', getWarehouseById);
router.post('/', addWarehouseItem);
router.delete('/:id', deleteWarehouseItem);

export default router;
