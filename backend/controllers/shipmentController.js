import Shipment from '../models/Shipment.js';
import { calculateShippingDetails, ALLOWED_TRANSITIONS } from '../utils/pricing.js';

export const getRates = (req, res) => {
  const { pickupPincode, deliveryPincode, length, breadth, height, weight, paymentMode } = req.body;
  if (!pickupPincode || !deliveryPincode || pickupPincode.length !== 6 || deliveryPincode.length !== 6) {
    return res.status(400).json({ error: 'Valid 6-digit pickup and delivery pincodes are required.' });
  }
  const result = calculateShippingDetails(pickupPincode, deliveryPincode, Number(length), Number(breadth), Number(height), Number(weight), paymentMode);
  res.json(result);
};

export const bookShipment = async (req, res) => {
  try {
    const { pickupPincode, deliveryPincode, length, breadth, height, weight, paymentMode, courierName } = req.body;
    const details = calculateShippingDetails(pickupPincode, deliveryPincode, Number(length), Number(breadth), Number(height), Number(weight), paymentMode);

    const selectedQuote = details.quotes.find(q => q.courierName === courierName);
    if (!selectedQuote) return res.status(400).json({ error: 'Invalid courier selected' });

    const awb = `LRG${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newShipment = await Shipment.create({
      awb,
      pickupPincode,
      deliveryPincode,
      dimensions: { length, breadth, height },
      actualWeight: weight,
      volumetricWeight: details.volumetricWeight,
      billedWeight: details.billedWeight,
      zone: details.zone,
      paymentMode,
      courierName,
      totalPrice: selectedQuote.totalPrice,
      currentStatus: 'CREATED',
      history: [{ status: 'CREATED', remarks: 'Shipment booked by seller' }]
    });

    res.status(201).json(newShipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { awb } = req.params;
    const { newStatus, remarks } = req.body;

    const shipment = await Shipment.findOne({ awb });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    const current = shipment.currentStatus;
    const allowedNext = ALLOWED_TRANSITIONS[current] || [];

    if (!allowedNext.includes(newStatus)) {
      return res.status(400).json({
        error: `Invalid transition from ${current} to ${newStatus}. Allowed: ${allowedNext.join(', ') || 'None'}`
      });
    }

    if (newStatus === 'NDR') {
      shipment.ndrAttempts += 1;
      if (shipment.ndrAttempts >= 3) {
        shipment.history.push({ status: 'NDR', remarks: `Failed attempt #${shipment.ndrAttempts}` });
        shipment.currentStatus = 'RTO_INITIATED';
        shipment.history.push({ status: 'RTO_INITIATED', remarks: 'Auto RTO initiated after 3 failed NDR attempts' });
        await shipment.save();
        return res.json(shipment);
      }
    }

    shipment.currentStatus = newStatus;
    shipment.history.push({ status: newStatus, remarks: remarks || `Status updated to ${newStatus}` });
    await shipment.save();
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getShipmentByAwb = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ awb: req.params.awb.toUpperCase() });
    if (!shipment) return res.status(404).json({ error: 'AWB not found' });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllShipments = async (req, res) => {
  const shipments = await Shipment.find().sort({ createdAt: -1 });
  res.json(shipments);
};