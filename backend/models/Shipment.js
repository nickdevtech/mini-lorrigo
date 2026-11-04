import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  remarks: { type: String }
});

const shipmentSchema = new mongoose.Schema({
  awb: { type: String, required: true, unique: true },
  pickupPincode: { type: String, required: true },
  deliveryPincode: { type: String, required: true },
  dimensions: { length: Number, breadth: Number, height: Number },
  actualWeight: Number,
  volumetricWeight: Number,
  billedWeight: Number,
  zone: String,
  paymentMode: { type: String, enum: ['PREPAID', 'COD'] },
  courierName: String,
  totalPrice: Number,
  currentStatus: {
    type: String,
    default: 'CREATED',
    enum: ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'NDR', 'RTO_INITIATED', 'RTO_DELIVERED']
  },
  ndrAttempts: { type: Number, default: 0 },
  history: [statusHistorySchema]
}, { timestamps: true });

export default mongoose.model('Shipment', shipmentSchema);