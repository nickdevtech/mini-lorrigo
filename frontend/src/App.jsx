import React, { useState, useEffect } from "react";
import RateCalculator from "./components/RateCalculator";
import ShipmentTracker from "./components/ShipmentTracker";

const API_BASE = '/api';

export default function App() {
  const [activeTab, setActiveTab] = useState("calculator");
  const [selectedAwb, setSelectedAwb] = useState("");
  const [shipments, setShipments] = useState([]);

  const fetchShipments = async () => {
    try {
      const res = await fetch(`${API_BASE}/shipments`);
      if (res.ok) {
        const data = await res.json();
        setShipments(data);
      }
    } catch (err) {
      console.error("Error fetching shipments:", err);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleBookingSuccess = (newShipment, switchToTrack = false) => {
    fetchShipments();
    setSelectedAwb(newShipment.awb);
    if (switchToTrack) {
      setActiveTab("track");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 font-sans antialiased">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-indigo-500/30">
              L
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
                Mini Lorrigo
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Logistics Engine
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Multi-Carrier Rate Calculator & AWB Lifecycle Manager
              </p>
            </div>
          </div>

          {/* Navigation Pills */}
          <nav className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab("calculator")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "calculator"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1. Rate Calculator & Book
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "track"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>2. Track & Lifecycle</span>
              {shipments.length > 0 && (
                <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full text-[10px]">
                  {shipments.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "calculator" ? (
          <RateCalculator onBookingSuccess={handleBookingSuccess} />
        ) : (
          <ShipmentTracker
            initialAwb={selectedAwb}
            shipments={shipments}
            onRefreshShipments={fetchShipments}
          />
        )}
      </main>
    </div>
  );
}
