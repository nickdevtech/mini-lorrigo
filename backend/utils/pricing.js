const COURIERS = [
  { name: 'SwiftShip', rates: { Local: { base: 30, extra: 25 }, Regional: { base: 40, extra: 35 }, National: { base: 55, extra: 45 } }, codFee: 30 },
  { name: 'BharatExpress', rates: { Local: { base: 25, extra: 25 }, Regional: { base: 35, extra: 30 }, National: { base: 50, extra: 45 } }, codFee: 35 },
  { name: 'QuickParcel', rates: { Local: { base: 35, extra: 20 }, Regional: { base: 45, extra: 30 }, National: { base: 60, extra: 40 } }, codFee: 40 }
];

const ALLOWED_TRANSITIONS = {
  CREATED: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'NDR'],
  NDR: ['OUT_FOR_DELIVERY', 'RTO_INITIATED'],
  RTO_INITIATED: ['RTO_DELIVERED'],
  DELIVERED: [],
  RTO_DELIVERED: []
};

function calculateShippingDetails(pickupPincode, deliveryPincode, l, b, h, weight, paymentMode) {
  let zone = 'National';
  if (pickupPincode.substring(0, 3) === deliveryPincode.substring(0, 3)) zone = 'Local';
  else if (pickupPincode.substring(0, 2) === deliveryPincode.substring(0, 2)) zone = 'Regional';

  const volumetricWeight = (l * b * h) / 5000;
  const maxWeight = Math.max(weight, volumetricWeight);
  const billedWeight = Math.ceil(maxWeight * 2) / 2;
  const extraSlabs = Math.max(0, Math.round((billedWeight - 0.5) / 0.5));

  const quotes = COURIERS.map(courier => {
    const rate = courier.rates[zone];
    const codCharge = paymentMode === 'COD' ? courier.codFee : 0;
    const totalPrice = rate.base + (extraSlabs * rate.extra) + codCharge;
    return { courierName: courier.name, baseRate: rate.base, extraSlabs, extraRate: rate.extra, codCharge, totalPrice };
  });

  quotes.sort((a, b) => a.totalPrice - b.totalPrice);
  return { zone, volumetricWeight: Number(volumetricWeight.toFixed(2)), billedWeight, quotes };
}

export default { calculateShippingDetails, ALLOWED_TRANSITIONS };