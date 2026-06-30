"use client";

import React, { useState, useMemo, useEffect } from "react";
import PartnerLayout from "@/components/partner/PartnerLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";
import ImageDropzone from "@/components/partner/ImageDropzone";

export default function PartnerPropertiesPage() {
  const router = useRouter();
  const { properties, syncProperties, activePartner, addLog } = useData();

  const partnerId = activePartner?.id || "partner-1";

  // Filter properties belonging to this partner
  const partnerProps = useMemo(() => {
    return properties.filter((p) => p.partnerId === partnerId || !p.partnerId);
  }, [properties, partnerId]);

  // Modal / Form Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard inputs
  const [newType, setNewType] = useState<"hotel" | "activity">("hotel");
  const [newTitle, setNewTitle] = useState("");
  const [newCity, setNewCity] = useState("Goa");
  const [newLocation, setNewLocation] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAmenities, setNewAmenities] = useState<string[]>([]);
  const [newCoverImage, setNewCoverImage] = useState("");
  
  // Policies
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [cancelPolicy, setCancelPolicy] = useState("Free cancellation up to 24 hours before check-in");

  // Verification guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("met_partner_session");
      if (!stored && !activePartner) {
        router.push("/partner/auth");
      }
    }
  }, [activePartner, router]);

  const handleToggleAmenity = (amenity: string) => {
    setNewAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddPropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice.trim()) return;

    const rate = parseFloat(newPrice);

    // Preset list of nice travel images depending on city/type
    const defaultImages = {
      hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      activity: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    };

    const newListing = {
      id: "prop-" + (properties.length + 101),
      partnerId: partnerId,
      destinationId: "dest-1", // default Goa
      type: newType,
      title: newTitle,
      city: newCity,
      location: newLocation,
      price: rate,
      image: newCoverImage || defaultImages[newType],
      gallery: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80",
      ],
      rating: 5.0,
      ratingCount: 1,
      amenities: newAmenities.length > 0 ? newAmenities : ["Free WiFi", "Swimming Pool"],
      description: newDesc || "Newly listed hospitality option offering premium spaces and dedicated services.",
      status: "Approved" as const, // Automatically approved in demo for seamless integration
      checkInTime,
      checkOutTime,
      cancellationPolicy: cancelPolicy,
      createdDate: new Date().toISOString().split("T")[0],
      reviews: [],
    };

    const updated = [newListing, ...properties];
    syncProperties(updated);

    addLog(`PARTNER_HUB: Registered new property: '${newTitle}'`);
    alert(`Success! Listing '${newTitle}' registered and approved.`);

    // Reset Form
    setNewTitle("");
    setNewPrice("");
    setNewLocation("");
    setNewDesc("");
    setNewAmenities([]);
    setNewCoverImage("");
    setWizardStep(1);
    setShowWizard(false);
  };

  const handleCardClick = (type: "hotel" | "activity", id: string) => {
    router.push(`/customer/${type}s/${id}`);
  };

  return (
    <PartnerLayout
      title="Property Inventory Hub"
      subtitle="Manage your stays, tours, details and verify verification status."
      actionButton={
        <button
          onClick={() => setShowWizard(true)}
          className="btn-primary"
          style={{ padding: "10px 20px", fontSize: "13px" }}
        >
          <i className="fa-solid fa-plus mr-1"></i> Register Property
        </button>
      }
    >
      {/* Properties Table List */}
      <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-extrabold text-primary">
            Supply Registry ({partnerProps.length} active listings)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="partner-table w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2">Listing</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Location</th>
                <th className="pb-2">Base Price</th>
                <th className="pb-2">Rating</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {partnerProps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-text-muted italic">
                    No listings found. Click "Register Property" to get started.
                  </td>
                </tr>
              ) : (
                partnerProps.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleCardClick(item.type, item.id)}
                  >
                    <td className="py-3 flex items-center gap-3">
                      <div className="w-12 h-12 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-primary">{item.title}</span>
                    </td>
                    <td className="py-3 text-text-main capitalize">{item.type}</td>
                    <td className="py-3 text-text-muted">
                      {item.location}, {item.city}
                    </td>
                    <td className="py-3 font-semibold text-secondary">
                      ₹{item.price.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-orange-500 font-bold">★ {item.rating}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === "Approved" || item.status === "Published"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Creator Wizard Dialog Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-border max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="text-base font-extrabold text-primary">
                Add New Property Listing (Step {wizardStep} of 3)
              </h3>
              <button
                className="text-text-muted hover:text-primary text-xl"
                onClick={() => {
                  setShowWizard(false);
                  setWizardStep(1);
                }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddPropertySubmit} className="p-6">
              {wizardStep === 1 && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Step 1: Basic Info</h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-text-main cursor-pointer">
                      <input
                        type="radio"
                        name="prop-type"
                        checked={newType === "hotel"}
                        onChange={() => setNewType("hotel")}
                      />
                      Hotel / Stay Accommodation
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-text-main cursor-pointer">
                      <input
                        type="radio"
                        name="prop-type"
                        checked={newType === "activity"}
                        onChange={() => setNewType("activity")}
                      />
                      Outdoor Experience / Tour
                    </label>
                  </div>
                  <div className="form-group flex flex-col gap-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase">Listing Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Whispering Pines Woods Resort"
                      className="border border-border p-2 rounded text-xs outline-none"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group flex flex-col gap-1">
                      <label className="text-[10px] text-text-muted font-bold uppercase">City Location</label>
                      <select
                        className="border border-border p-2 rounded text-xs outline-none"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                      >
                        <option value="Goa">Goa, India</option>
                        <option value="Bali">Bali, Indonesia</option>
                        <option value="Tokyo">Tokyo, Japan</option>
                        <option value="Paris">Paris, France</option>
                        <option value="Jaipur">Jaipur, India</option>
                        <option value="Manali">Manali, India</option>
                        <option value="Udaipur">Udaipur, India</option>
                        <option value="Rishikesh">Rishikesh, India</option>
                        <option value="Kerala">Kerala, India</option>
                      </select>
                    </div>
                    <div className="form-group flex flex-col gap-1">
                      <label className="text-[10px] text-text-muted font-bold uppercase">
                        Base Rate (₹ / Night or Guest)
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 8500"
                        className="border border-border p-2 rounded text-xs outline-none"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group flex flex-col gap-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase">Detailed Address</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Calangute Main Road, Candolim"
                      className="border border-border p-2 rounded text-xs outline-none"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Step 2: Details & Description</h4>
                  <div className="form-group flex flex-col gap-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase">Overview Description</label>
                    <textarea
                      placeholder="Describe the amenities, room features, view options etc."
                      rows={3}
                      className="border border-border p-2 rounded text-xs outline-none"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-[10px] text-text-muted font-bold uppercase block mb-2">Amenities</label>
                    <div className="grid grid-cols-2 gap-2.5 text-xs text-text-main">
                      {["Free WiFi", "Swimming Pool", "Ocean View", "Spa", "Safety Gear Included", "Certified Instructors"].map((item) => (
                        <label className="flex items-center gap-1.5 cursor-pointer" key={item}>
                          <input
                            type="checkbox"
                            checked={newAmenities.includes(item)}
                            onChange={() => handleToggleAmenity(item)}
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group flex flex-col gap-1">
                      <label className="text-[10px] text-text-muted font-bold uppercase">Check-in Hours</label>
                      <input
                        type="text"
                        className="border border-border p-2 rounded text-xs outline-none"
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                      />
                    </div>
                    <div className="form-group flex flex-col gap-1">
                      <label className="text-[10px] text-text-muted font-bold uppercase">Check-out Hours</label>
                      <input
                        type="text"
                        className="border border-border p-2 rounded text-xs outline-none"
                        value={checkOutTime}
                        onChange={(e) => setCheckOutTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Step 3: Cover Photo Upload</h4>
                  <div className="form-group flex flex-col gap-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase">Cover Image URL (Direct Link)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/photo-1540555700478-4be289fbecef..."
                      className="border border-border p-2 rounded text-xs outline-none mb-3"
                      value={newCoverImage}
                      onChange={(e) => setNewCoverImage(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">
                      Or upload files via dropzone
                    </label>
                    <ImageDropzone
                      onChange={(images) => {
                        if (images.length > 0) {
                          setNewCoverImage(images[0].url);
                        }
                      }}
                    />
                  </div>
                  <div className="form-group flex flex-col gap-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase">Cancellation Policy</label>
                    <input
                      type="text"
                      className="border border-border p-2 rounded text-xs outline-none"
                      value={cancelPolicy}
                      onChange={(e) => setCancelPolicy(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex justify-between items-center mt-8 border-t border-border pt-4">
                <button
                  type="button"
                  className="bg-slate-100 hover:bg-slate-200 text-text-main px-4 py-2 text-xs font-bold rounded"
                  onClick={() => {
                    if (wizardStep > 1) setWizardStep((prev) => prev - 1);
                    else {
                      setShowWizard(false);
                      setWizardStep(1);
                    }
                  }}
                >
                  {wizardStep === 1 ? "Cancel" : "Back"}
                </button>

                {wizardStep < 3 ? (
                  <button
                    type="button"
                    className="bg-primary hover:bg-primary-light text-white px-5 py-2 text-xs font-bold rounded"
                    onClick={() => setWizardStep((prev) => prev + 1)}
                  >
                    Next Step
                  </button>
                ) : (
                  <button type="submit" className="btn-primary px-6 py-2 text-xs font-bold">
                    Submit Listing
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </PartnerLayout>
  );
}
