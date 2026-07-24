"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function FilterTabs({ activeStatus }: { activeStatus: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statuses = [
    { value: "All", label: "All Students" },
    { value: "Taken", label: "Marked Taken" },
    { value: "Skipped", label: "Marked Skipped" },
    { value: "NotMarked", label: "Not Marked" },
  ];

  const handleSelect = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "All") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    router.push(`/admin/users?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 bg-surface-low p-1 rounded-xl border border-border">
      {statuses.map((s) => (
        <button
          key={s.value}
          onClick={() => handleSelect(s.value)}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeStatus === s.value
              ? "bg-card text-white border border-border"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
