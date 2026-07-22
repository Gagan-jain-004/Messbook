"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      if (value.trim()) {
        router.push(`/admin/users?q=${encodeURIComponent(value.trim())}`);
      } else {
        router.push(`/admin/users`);
      }
    });
  };

  return (
    <form onSubmit={handleSearch} className="relative flex items-center">
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search users by name or email..."
        className="w-full max-w-sm bg-surface-low border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-muted-foreground focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all"
      />
      {isPending && <span className="text-xs text-muted-foreground ml-3">Searching...</span>}
    </form>
  );
}
