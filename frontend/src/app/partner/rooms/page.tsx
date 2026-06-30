"use client";

import React, { useState, useEffect, useMemo } from "react";
import PartnerLayout from "@/components/partner/PartnerLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

export default function PartnerRoomsPage() {
  const router = useRouter();
  const { properties, activePartner, addLog } = useData();

  const partnerId = activePartner?.id || "partner-1";

  // Filter properties that are hotels managed by this partner
  const hotels = useMemo(() => {
    return properties.filter(
      (p) => (p.partnerId === partnerId || !p.partnerId) && p.type === "hotel"
    );
  }, [properties, partnerId]);

  const [selectedHotelId, setSelectedHotelId] = useState<string>("");

  useEffect(() => {
    if (hotels.length > 0 && !selectedHotelId) {
      setSelectedHotelId(hotels[0].id);
    }
  }, [hotels, selectedHotelId]);

  // Mock list of room categories inside the selected hotel
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedHotelId) return;

    // Load custom rooms or seed defaults
    const key = `met_rooms_${selectedHotelId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setRooms(JSON.parse(stored));
    } else {
      const defaultRooms = [
        {
          id: "RM-101",
          name: "Deluxe King Room",
          type: "Double Room",
          capacity: 2,
          price: 12000,
          status: "Available",
          blockedDates: ["2026-06-15", "2026-06-16"],
        },
        {
          id: "RM-102",
          name: "Executive Ocean Suite",
          type: "Suite",
          capacity: 3,
          price: 24000,
          status: "Available",
          blockedDates: [],
        },
        {
          id: "RM-103",
          name: "Standard Twin Room",
          type: "Twin Room",
          capacity: 2,
          price: 8000,
          status: "Maintenance",
          blockedDates: [],
        },
      ];
      localStorage.setItem(key, JSON.stringify(defaultRooms));
      setRooms(defaultRooms);
    }
  }, [selectedHotelId]);

  // Add Room Category form
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState("Double Room");
  const [newRoomCapacity, setNewRoomCapacity] = useState("2");
  const [newRoomPrice, setNewRoomPrice] = useState("");

  // Block Dates state
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [dateToToggle, setDateToToggle] = useState("2026-06-25");

  // Verification guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("met_partner_session");
      if (!stored && !activePartner) {
        router.push("/partner/auth");
      }
    }
  }, [activePartner, router]);

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || !newRoomPrice.trim() || !selectedHotelId) return;

    const newRoom = {
      id: "RM-" + Math.floor(Math.random() * 900 + 100),
      name: newRoomName,
      type: newRoomType,
      capacity: parseInt(newRoomCapacity),
      price: parseFloat(newRoomPrice),
      status: "Available",
      blockedDates: [],
    };

    const updated = [...rooms, newRoom];
    setRooms(updated);
    localStorage.setItem(`met_rooms_${selectedHotelId}`, JSON.stringify(updated));

    setNewRoomName("");
    setNewRoomPrice("");
    setShowAddRoom(false);
    addLog(`ROOM_HUB: Registered room category ${newRoomName} under hotel id ${selectedHotelId}`);
  };

  const handleToggleBlockDate = () => {
    if (!activeRoom || !dateToToggle || !selectedHotelId) return;

    const updated = rooms.map((r) => {
      if (r.id === activeRoom.id) {
        let blocked = r.blockedDates || [];
        if (blocked.includes(dateToToggle)) {
          blocked = blocked.filter((d: string) => d !== dateToToggle);
        } else {
          blocked.push(dateToToggle);
        }
        return { ...r, blockedDates: blocked };
      }
      return r;
    });

    setRooms(updated);
    localStorage.setItem(`met_rooms_${selectedHotelId}`, JSON.stringify(updated));
    
    const updatedActive = updated.find((r) => r.id === activeRoom.id);
    setActiveRoom(updatedActive);

    addLog(`ROOM_HUB: Toggled block status of date ${dateToToggle} for room ${activeRoom.name}`);
  };

  const handleRoomStatusChange = (roomId: string, newStatus: string) => {
    if (!selectedHotelId) return;
    const updated = rooms.map((r) => {
      if (r.id === roomId) {
        return { ...r, status: newStatus };
      }
      return r;
    });
    setRooms(updated);
    localStorage.setItem(`met_rooms_${selectedHotelId}`, JSON.stringify(updated));
    addLog(`ROOM_HUB: Changed status of room ${roomId} to ${newStatus}`);
  };

  return (
    <PartnerLayout
      title="Room Inventory Management"
      subtitle="Configure room categories, pricing tiers, and calendar blocked dates."
      actionButton={
        <div className="flex gap-3">
          <select
            className="border border-border p-2 rounded text-xs outline-none bg-white font-semibold text-primary"
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
          >
            {hotels.map((h) => (
              <option value={h.id} key={h.id}>
                {h.title}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAddRoom(true)}
            className="btn-primary"
            style={{ padding: "10px 20px", fontSize: "13px" }}
          >
            <i className="fa-solid fa-plus mr-1"></i> Add Room Category
          </button>
        </div>
      }
    >
      <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-extrabold text-primary">
            Room Inventories for selected hotel
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-text-muted text-xs italic">
              No room categories registered for this hotel. Click "Add Room Category" to start.
            </div>
          ) : (
            rooms.map((room) => (
              <div
                className="room-card border border-border bg-slate-50 p-5 rounded-lg flex flex-col justify-between"
                key={room.id}
              >
                <div>
                  <span className="text-[9px] bg-slate-100 border border-border px-1.5 py-0.5 rounded text-text-muted font-mono font-bold">
                    ID: {room.id} • {room.type}
                  </span>
                  <h4 className="text-sm font-extrabold text-primary mt-2">{room.name}</h4>
                  <div className="flex gap-2.5 text-[10px] text-text-muted mt-1.5">
                    <span>
                      <i className="fa-solid fa-user-group mr-1"></i> Capacity: {room.capacity}
                    </span>
                    <span>
                      <i className="fa-solid fa-calendar-xmark mr-1"></i> Blocked: {room.blockedDates?.length || 0} dates
                    </span>
                  </div>
                  <div className="text-sm font-bold text-secondary mt-3">
                    ₹{room.price.toLocaleString("en-IN")} / Night
                  </div>
                </div>

                <div className="flex justify-between items-center mt-5 pt-3 border-t border-border/60">
                  <select
                    className="border border-border p-1 rounded text-[10px] bg-white text-text-main font-semibold outline-none"
                    value={room.status}
                    onChange={(e) => handleRoomStatusChange(room.id, e.target.value)}
                  >
                    <option value="Available">Available</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Booked">Booked</option>
                  </select>
                  <button
                    onClick={() => {
                      setActiveRoom(room);
                      setShowCalendarModal(true);
                    }}
                    className="text-xs text-secondary font-bold hover:underline"
                  >
                    <i className="fa-solid fa-calendar-days mr-1"></i> Block Dates
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Room Modal Form */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-border max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-primary">Add Room Category</h3>
              <button
                className="text-text-muted hover:text-primary text-xl"
                onClick={() => setShowAddRoom(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddRoom} className="flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Room Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deluxe Twin Bed Room"
                  className="border border-border p-2 rounded text-xs outline-none"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Room Type</label>
                  <select
                    className="border border-border p-2 rounded text-xs outline-none"
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value)}
                  >
                    <option value="Double Room">Double Room</option>
                    <option value="Suite">Suite</option>
                    <option value="Twin Room">Twin Room</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Max Capacity</label>
                  <select
                    className="border border-border p-2 rounded text-xs outline-none"
                    value={newRoomCapacity}
                    onChange={(e) => setNewRoomCapacity(e.target.value)}
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                  </select>
                </div>
              </div>
              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Price Per Night (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 9500"
                  className="border border-border p-2 rounded text-xs outline-none"
                  value={newRoomPrice}
                  onChange={(e) => setNewRoomPrice(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs">
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Block Dates Calendar Modal */}
      {showCalendarModal && activeRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-border max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-primary">Block Dates: {activeRoom.name}</h3>
              <button
                className="text-text-muted hover:text-primary text-xl"
                onClick={() => {
                  setShowCalendarModal(false);
                  setActiveRoom(null);
                }}
              >
                &times;
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-xs text-text-main">
                Select a date to block or unblock for inventory bookings:
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="border border-border p-2 rounded text-xs outline-none flex-grow"
                  value={dateToToggle}
                  onChange={(e) => setDateToToggle(e.target.value)}
                />
                <button
                  onClick={handleToggleBlockDate}
                  className="bg-primary hover:bg-primary-light text-white text-xs font-bold px-4 py-2 rounded"
                >
                  Toggle Date
                </button>
              </div>

              {/* Display currently blocked dates */}
              <div className="mt-2">
                <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">
                  Currently Blocked Dates:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {activeRoom.blockedDates?.length === 0 ? (
                    <span className="text-xs text-text-muted italic">No blocked dates.</span>
                  ) : (
                    activeRoom.blockedDates?.map((d: string) => (
                      <span
                        key={d}
                        className="bg-red-50 text-red-500 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded"
                      >
                        {d}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PartnerLayout>
  );
}
