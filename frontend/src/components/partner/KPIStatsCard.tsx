"use client";

import React from "react";

interface KPIStatsCardProps {
  title: string;
  value: string | number;
  subText: string | React.ReactNode;
  type?: "default" | "accent" | "success" | "warning";
}

export default function KPIStatsCard({
  title,
  value,
  subText,
  type = "default",
}: KPIStatsCardProps) {
  const getCardClass = () => {
    switch (type) {
      case "accent":
        return "kpi-card accent";
      case "success":
        return "kpi-card success";
      case "warning":
        return "kpi-card warning";
      default:
        return "kpi-card";
    }
  };

  const getSubtextClass = () => {
    switch (type) {
      case "success":
        return "kpi-trend success";
      case "warning":
        return "kpi-trend warning";
      default:
        return "kpi-trend";
    }
  };

  return (
    <div className={getCardClass()}>
      <div className="kpi-title">{title}</div>
      <div className="kpi-val">{value}</div>
      <div className={getSubtextClass()}>{subText}</div>
    </div>
  );
}
