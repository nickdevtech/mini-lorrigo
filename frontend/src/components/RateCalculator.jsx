import React, { useState } from "react";
const API_BASE = "/api";

export default function RateCalculator({ onBookingSuccess }) {
  const [form, setForm] = useState({
    pickupPincode: "110085",
    deliveryPincode: "560001",
    length: 30,
    breadth: 20,
    height: 10,
    weight: 0.8,
    paymentMode: "COD",
  });

  const [rateResult, setRateResult] = useState(null);
  const [bookedShipment, setBookedShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingCourier, setBookingCourier] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCalculate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setBookedShipment(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) setRateResult(data);
      else setErrorMsg(data.error || "Failed to calculate rates");
    } catch (err) {
      setErrorMsg("Unable to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (courierName) => {
    setErrorMsg("");
    setBookingCourier(courierName);
    try {
      const res = await fetch(`${API_BASE}/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, courierName }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookedShipment(data);
        if (onBookingSuccess) onBookingSuccess(data);
      } else {
        setErrorMsg(data.error || "Booking failed");
      }
    } catch (err) {
      setErrorMsg("Network error while booking shipment.");
    } finally {
      setBookingCourier(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Package Details Form */}
      <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Shipment Specifications
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter origin, destination & package metrics
          </p>
        </div>

        <form onSubmit={handleCalculate} className="p-6 space-y-5">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg("")}
                className="text-rose-400 hover:text-rose-600 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Pincodes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Pickup Pincode
              </label>
              <input
                type="text"
                maxLength={6}
                value={form.pickupPincode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pickupPincode: e.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder="110085"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Delivery Pincode
              </label>
              <input
                type="text"
                maxLength={6}
                value={form.deliveryPincode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deliveryPincode: e.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder="560001"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Package Dimensions (CM)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={form.length}
                  onChange={(e) => setForm({ ...form, length: e.target.value })}
                  className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  L
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={form.breadth}
                  onChange={(e) =>
                    setForm({ ...form, breadth: e.target.value })
                  }
                  className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  B
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  H
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Volumetric divisor: (L × B × H) / 5000
            </p>
          </div>

          {/* Dead Weight & Payment Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Actual Weight (KG)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                  kg
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Payment Mode
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {["COD", "PREPAID"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setForm({ ...form, paymentMode: mode })}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      form.paymentMode === mode
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "Calculating Quotes..." : "Calculate Shipping Rates →"}
          </button>
        </form>
      </div>

      {/* Right Column: Rate Quotes & Booking Confirmation */}
      <div className="lg:col-span-7 space-y-6">
        {bookedShipment && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                ✓ Shipment Confirmed
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                AWB Assigned:{" "}
                <span className="font-mono text-indigo-600 underline decoration-indigo-300">
                  {bookedShipment.awb}
                </span>
              </h3>
              <p className="text-xs text-slate-600">
                Booked via{" "}
                <span className="font-semibold">
                  {bookedShipment.courierName}
                </span>{" "}
                • Total Freight:{" "}
                <span className="font-semibold">
                  ₹{bookedShipment.totalPrice}
                </span>
              </p>
            </div>
            <button
              onClick={() => onBookingSuccess(bookedShipment, true)}
              className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Track AWB Live →
            </button>
          </div>
        )}

        {rateResult ? (
          <div className="space-y-5">
            {/* Weight & Zone Summary Strip */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Detected Zone
                </span>
                <span className="text-xl font-extrabold text-indigo-600 mt-1 block">
                  {rateResult.zone}
                </span>
                <span className="text-[11px] text-slate-500">
                  {form.pickupPincode} → {form.deliveryPincode}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Volumetric Wt.
                </span>
                <span className="text-xl font-extrabold text-slate-800 mt-1 block">
                  {rateResult.volumetricWeight}{" "}
                  <span className="text-xs font-normal text-slate-500">kg</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Actual: {form.weight} kg
                </span>
              </div>
              <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 block">
                  Billed Weight
                </span>
                <span className="text-xl font-extrabold mt-1 block">
                  {rateResult.billedWeight}{" "}
                  <span className="text-xs font-normal text-indigo-200">
                    kg
                  </span>
                </span>
                <span className="text-[11px] text-indigo-200">
                  0.5 kg slab rounded
                </span>
              </div>
            </div>

            {/* Courier Rate Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Available Courier Partners ({rateResult.quotes.length})
                </h3>
                <span className="text-xs font-medium text-slate-400">
                  Sorted by lowest freight
                </span>
              </div>

              {rateResult.quotes.map((quote, idx) => {
                const isBestValue = idx === 0;
                return (
                  <div
                    key={quote.courierName}
                    className={`group relative rounded-2xl p-5 transition-all bg-white border ${
                      isBestValue
                        ? "border-indigo-500 ring-2 ring-indigo-500/10 shadow-md"
                        : "border-slate-200/90 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    {isBestValue && (
                      <span className="absolute -top-2.5 left-5 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                        ★ Cheapest Option
                      </span>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-sm">
                            {quote.courierName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-900">
                              {quote.courierName}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Surface & Air Express • {rateResult.zone} Zone
                            </p>
                          </div>
                        </div>

                        {/* Charge Breakdown Pills */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                            Base (0.5kg):{" "}
                            <strong className="text-slate-800">
                              ₹{quote.baseRate}
                            </strong>
                          </span>
                          <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                            Extra Slabs ({quote.extraSlabs} × ₹{quote.extraRate}
                            ):{" "}
                            <strong className="text-slate-800">
                              ₹{quote.extraSlabs * quote.extraRate}
                            </strong>
                          </span>
                          <span
                            className={`text-[11px] font-medium px-2.5 py-1 rounded-lg ${quote.codCharge > 0 ? "bg-amber-50 text-amber-800 border border-amber-200/60" : "bg-slate-100 text-slate-500"}`}
                          >
                            COD Fee: <strong>₹{quote.codCharge}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 gap-2">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Total Freight
                          </span>
                          <span className="text-2xl font-black text-slate-900">
                            ₹{quote.totalPrice}
                          </span>
                        </div>
                        <button
                          onClick={() => handleBook(quote.courierName)}
                          disabled={bookingCourier === quote.courierName}
                          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                            isBestValue
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20"
                              : "bg-slate-900 hover:bg-slate-800 text-white"
                          } disabled:opacity-50`}
                        >
                          {bookingCourier === quote.courierName
                            ? "Booking..."
                            : "Book Shipment"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl font-bold">
              ⚖️
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Rate Quotes Calculated Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Submit your pickup pincode, delivery pincode, and package
              dimensions on the left to compare instant courier pricing across
              zones.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
