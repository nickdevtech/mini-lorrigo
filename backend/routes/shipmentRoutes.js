import express from 'express';
import {
  getRates,
  bookShipment,
  updateStatus,
  getShipmentByAwb,
  getAllShipments
} from '../controllers/shipmentController.js';

const router = express.Router();

router.post('/rates', getRates);
router.post('/shipments', bookShipment);
router.get('/shipments', getAllShipments);
router.get('/shipments/:awb', getShipmentByAwb);
router.post('/shipments/:awb/status', updateStatus);

export default router;