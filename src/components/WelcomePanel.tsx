"use client";

import { Clock3, CloudSun } from "lucide-react";
import { useEffect, useState } from "react";

export default function WelcomePanel() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hours24 = now.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const greeting =
    hours24 < 12
      ? "Good morning,"
      : hours24 < 17
        ? "Good afternoon,"
        : "Good evening,";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Top */}
      <div>
        {/* Logo */}
        <div className="mb-4 flex items-center gap-2">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-xl bg-blue-500/25 blur-xl" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-[0_8px_24px_rgba(59,130,246,0.35)]">
              <span className="text-base font-black">A</span>
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-black leading-none tracking-tight">
              Attendix
            </h1>
            <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-zinc-400">
              Attendance System
            </p>
          </div>
        </div>

        {/* Greeting */}
        <p className="text-sm text-zinc-400">{greeting}</p>

        <h2 className="mt-0.5 bg-gradient-to-r from-white to-violet-300 bg-clip-text text-3xl font-black leading-none tracking-tight text-transparent">
          Welcome!
        </h2>

        <p className="mt-3 text-xs leading-relaxed text-zinc-400">
          Scan in. Show up.
          <br />
          Make your day count.
        </p>

        {/* Accent */}
        <div className="mt-4 h-1 w-10 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
      </div>

      {/* Clock Card */}
      <div className="rounded-[18px] border border-white/10 bg-white/[0.05] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.30)] backdrop-blur-3xl">
        {/* Top */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <Clock3 className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400">Current Time</p>
            <p className="text-[11px] font-medium">Live System Clock</p>
          </div>
        </div>

        {/* Time — live */}
        <h3 className="text-[38px] font-black leading-none tracking-tight">
          {String(hours12).padStart(2, "0")}:{minutes}
          <span className="ml-1 text-base text-violet-400">{ampm}</span>
        </h3>

        <p className="mt-1.5 text-[10px] text-zinc-400">{dateStr}</p>

        {/* Divider */}
        <div className="my-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Weather */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
            <CloudSun className="h-4 w-4 text-yellow-300" />
          </div>
          <div>
            <p className="text-[11px] font-semibold">Partly Cloudy</p>
            <p className="text-[10px] text-zinc-400">25°C</p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-2 w-2 shrink-0 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />
        <div>
          <p className="text-[11px] font-semibold">System Online</p>
          <p className="text-[10px] text-zinc-400">All systems operational</p>
        </div>
      </div>
    </div>
  );
}
