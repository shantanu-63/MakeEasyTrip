"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  sender: "user" | "agent";
  text: string;
}

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "agent",
      text: "Hello! I am your AI Support Assistant. Ask me anything about your bookings, partner listings, or travel itineraries!",
    },
  ]);

  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    const text = inputVal.trim();
    if (!text) return;

    // Append user message
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInputVal("");

    // Simulate automated AI response
    setTimeout(() => {
      let reply =
        "I'm not sure about that. Try switching to the 'Partner Portal' or explore the 'Admin Control Panel' to manage listings and bookings!";

      const q = text.toLowerCase();
      if (q.includes("booking") || q.includes("ticket") || q.includes("resort") || q.includes("hotel")) {
        reply =
          "You can view all your active bookings under your traveler dashboard in the <strong>My Bookings</strong> section.";
      } else if (q.includes("hi") || q.includes("hello")) {
        reply = "Hello! How can I help you manage your Make Easy Trip platform today?";
      } else if (q.includes("partner") || q.includes("approve") || q.includes("list")) {
        reply =
          "Any properties added in the Partner Portal get queued for Super Admin validation. Switch to 'Admin Control Panel' to review and approve listings!";
      } else if (q.includes("refund") || q.includes("cancel")) {
        reply =
          "You have free cancellation on all standard bookings. Simply head to the Traveler dashboard and request ticket adjustments.";
      }

      setMessages((prev) => [...prev, { sender: "agent", text: reply }]);
    }, 1000);
  };

  return (
    <>
      {/* Support widget bubble trigger */}
      <div className="support-widget-bubble" onClick={() => setIsOpen(!isOpen)}>
        <i className="fa-solid fa-headset"></i>
      </div>

      {/* Support widget chat panel */}
      {isOpen && (
        <div className="support-widget-panel active" id="support-chat-widget">
          {/* Header */}
          <div className="support-panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <i className="fa-solid fa-robot" style={{ fontSize: "20px", color: "var(--color-secondary)" }}></i>
              <div>
                <h4 style={{ color: "var(--color-bg-white)", fontSize: "13px", fontWeight: 700 }}>
                  Support Bot (OpenAI)
                </h4>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>Online • AI Assistance</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: "var(--color-bg-white)", fontSize: "20px" }}>
              &times;
            </button>
          </div>

          {/* Chat message streams */}
          <div className="support-chat-history" id="support-chat-history">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-msg ${m.sender}`} dangerouslySetInnerHTML={{ __html: m.text }} />
            ))}
            <div ref={historyEndRef} />
          </div>

          {/* Input control deck */}
          <div className="support-chat-input-bar">
            <input
              type="text"
              id="support-chat-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <button className="support-chat-send" onClick={handleSend}>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
