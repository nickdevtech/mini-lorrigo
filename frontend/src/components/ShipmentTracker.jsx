import React, { useState, useEffect } from "react";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "/api";

const ALLOWED_NEXT = {
  CREATED: ["PICKED_UP"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "NDR"],
  NDR: ["OUT_FOR_DELIVERY", "RTO_INITIATED"],
  RTO_INITIATED: ["RTO_DELIVERED"],
  DELIVERED: [],
  RTO_DELIVERED: [],
};

const LIFECYCLE_STEPS = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function ShipmentTracker({ initialAwb }) {
  const [allShipments, setAllShipments] = useState([]);
  const [searchAwb, setSearchAwb] = useState(initialAwb || "");
  const [trackedShipment, setTrackedShipment] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    if (initialAwb) {
      setSearchAwb(initialAwb);
      handleTrack(initialAwb);
    }
  }, [initialAwb]);

  const fetchShipments = async () => {
    try {
      const res = await fetch(`${API_BASE}/shipments`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllShipments(data);
        // Agar koi shipment select nahi hai, toh pehli wali auto-select kar dega
        if (!trackedShipment && !initialAwb && data.length > 0) {
          setTrackedShipment(data[0]);
          setSearchAwb(data[0].awb);
        }
      }
    } catch (err) {
      console.error("Error fetching shipments:", err);
    }
  };

  const handleTrack = async (awbInput) => {
    const rawAwb = typeof awbInput === "string" ? awbInput : searchAwb;
    const targetAwb = (rawAwb || "").trim().toUpperCase();
    if (!targetAwb) return;

    setErrorMsg("");

    const foundLocal = allShipments.find(
      (s) => s.awb?.toUpperCase() === targetAwb,
    );
    if (foundLocal) {
      setTrackedShipment(foundLocal);
      setSearchAwb(foundLocal.awb);
    }

    try {
      const res = await fetch(`${API_BASE}/shipments/${targetAwb}`);
      const data = await res.json();
      if (res.ok) {
        setTrackedShipment(data);
        setSearchAwb(data.awb);
      } else if (!foundLocal) {
        setTrackedShipment(null);
        setErrorMsg(data.error || "AWB not found");
      }
    } catch (err) {
      if (!foundLocal) setErrorMsg("Failed to fetch tracking details");
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!trackedShipment) return;
    setUpdating(true);
    setErrorMsg("");
    try {
      const res = await fetch(
        `${API_BASE}/shipments/${trackedShipment.awb}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newStatus,
            remarks: remarks.trim() || `Status updated to ${newStatus}`,
          }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setTrackedShipment(data);
        setRemarks("");
        fetchShipments(); // List refresh karein
      } else {
        setErrorMsg(data.error || "Invalid status transition");
      }
    } catch (err) {
      setErrorMsg("Error updating shipment status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "DELIVERED")
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (status === "NDR") return "bg-amber-100 text-amber-800 border-amber-200";
    if (status?.startsWith("RTO"))
      return "bg-rose-100 text-rose-800 border-rose-200";
    return "bg-indigo-100 text-indigo-800 border-indigo-200";
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      {/* Left Sidebar: Search & Recent Bookings */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Track by AWB
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. LRG12345678"
              value={searchAwb}
              onChange={(e) => setSearchAwb(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleTrack(searchAwb)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
            <button
              type="button"
              onClick={() => handleTrack(searchAwb)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shrink-0"
            >
              Search
            </button>
          </div>
        </div>

        {/* Recent Bookings List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Recent Bookings ({allShipments.length})
            </h3>
            <button
              type="button"
              onClick={fetchShipments}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              ↻ Refresh
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-115 overflow-y-auto">
            {allShipments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No shipments found in database.
              </div>
            ) : (
              allShipments.map((s) => {
                const isSelected = trackedShipment?.awb === s.awb;
                return (
                  <div
                    key={s.awb || s._id}
                    onClick={() => {
                      setTrackedShipment(s);
                      setSearchAwb(s.awb);
                      handleTrack(s.awb);
                    }}
                    className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-50/80 border-l-4 border-indigo-600"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className="font-mono font-bold text-sm text-slate-900">
                        {s.awb}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {s.courierName} • {s.pickupPincode} →{" "}
                        {s.deliveryPincode}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${getStatusStyle(s.currentStatus)}`}
                    >
                      {s.currentStatus}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Content: Shipment Details & Timeline */}
      <div className="lg:col-span-8 space-y-6">
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {trackedShipment ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            {/* Top Banner */}
            <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Air Waybill Number
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-2xl font-mono font-black tracking-tight">
                    {trackedShipment.awb}
                  </h2>
                  <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg font-medium text-slate-300">
                    {trackedShipment.courierName}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  Route:{" "}
                  <strong className="text-white">
                    {trackedShipment.pickupPincode}
                  </strong>{" "}
                  →{" "}
                  <strong className="text-white">
                    {trackedShipment.deliveryPincode}
                  </strong>{" "}
                  ({trackedShipment.zone} Zone) • Billed:{" "}
                  <strong className="text-white">
                    {trackedShipment.billedWeight} kg
                  </strong>{" "}
                  • Mode:{" "}
                  <strong className="text-white">
                    {trackedShipment.paymentMode} (₹{trackedShipment.totalPrice}
                    )
                  </strong>
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  Current State
                </span>
                <span
                  className={`inline-block text-xs font-extrabold px-3.5 py-1.5 rounded-full border ${getStatusStyle(trackedShipment.currentStatus)}`}
                >
                  {trackedShipment.currentStatus}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Visual Step Progress Bar */}
              <div className="grid grid-cols-5 gap-2">
                {LIFECYCLE_STEPS.map((step) => {
                  const visited = trackedShipment.history?.some(
                    (h) => h.status === step,
                  );
                  const isCurrent = trackedShipment.currentStatus === step;
                  return (
                    <div key={step} className="text-center">
                      <div
                        className={`h-2 rounded-full mb-2 transition-all ${
                          isCurrent
                            ? "bg-indigo-600 ring-4 ring-indigo-100"
                            : visited
                              ? "bg-emerald-500"
                              : "bg-slate-200"
                        }`}
                      />
                      <span
                        className={`text-[10px] font-bold block truncate ${isCurrent ? "text-indigo-700" : visited ? "text-slate-700" : "text-slate-400"}`}
                      >
                        {step.replaceAll("_", " ")}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status Simulator */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      🚀 Update Status Simulator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Strict forward-only transition enforcement (Auto-RTO on
                      3rd NDR)
                    </p>
                  </div>
                  {trackedShipment.ndrAttempts > 0 && (
                    <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-extrabold px-3 py-1 rounded-full">
                      NDR Failed Attempts: {trackedShipment.ndrAttempts} / 3
                    </span>
                  )}
                </div>

                {ALLOWED_NEXT[trackedShipment.currentStatus]?.length > 0 ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Optional scan remarks (e.g. Consignee unavailable / Arrived at hub)"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                    />
                    <div className="flex flex-wrap gap-2.5">
                      {ALLOWED_NEXT[trackedShipment.currentStatus].map(
                        (nextStatus) => {
                          const isDanger =
                            nextStatus === "NDR" ||
                            nextStatus.startsWith("RTO");
                          return (
                            <button
                              key={nextStatus}
                              disabled={updating}
                              onClick={() => handleUpdateStatus(nextStatus)}
                              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 ${
                                isDanger
                                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
                              } disabled:opacity-50`}
                            >
                              <span>Move to {nextStatus}</span>
                              <span>→</span>
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <span>🔒</span>
                    <span>
                      Shipment reached terminal state (
                      {trackedShipment.currentStatus}).
                    </span>
                  </div>
                )}
              </div>

              {/* Status History Timeline */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Status History ({trackedShipment.history?.length || 0} Events)
                </h3>
                <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
                  {(trackedShipment.history || [])
                    .slice()
                    .reverse()
                    .map((event, idx) => (
                      <div key={idx} className="relative">
                        <span
                          className={`absolute -left-7.75 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            idx === 0
                              ? "bg-indigo-600 ring-4 ring-indigo-100"
                              : "bg-slate-400"
                          }`}
                        />
                        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span
                              className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded border mb-1 ${getStatusStyle(event.status)}`}
                            >
                              {event.status}
                            </span>
                            <p className="text-xs font-medium text-slate-700">
                              {event.remarks}
                            </p>
                          </div>
                          <time className="text-[11px] font-mono text-slate-400 shrink-0">
                            {new Date(event.timestamp).toLocaleString()}
                          </time>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-2">
            <p className="text-base font-bold text-slate-700">
              Select a shipment from the left or search by AWB
            </p>
            <p className="text-xs text-slate-400">
              View real-time scan logs and test forward-only status transitions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
