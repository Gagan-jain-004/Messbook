"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AdminDashboardChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock weekly active user data for system health dashboard display
  const weeklyData = [
    { name: "Mon", Users: 640 },
    { name: "Tue", Users: 780 },
    { name: "Wed", Users: 850 },
    { name: "Thu", Users: 710 },
    { name: "Fri", Users: 690 },
    { name: "Sat", Users: 420 },
    { name: "Sun", Users: 380 },
  ];

  if (!mounted) {
    return <div className="h-64 w-full bg-surface-low/20 animate-pulse rounded-xl" />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#262626" }}
            itemStyle={{ color: "#ffffff" }}
            labelStyle={{ color: "#64748b" }}
          />
          <Bar dataKey="Users" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
