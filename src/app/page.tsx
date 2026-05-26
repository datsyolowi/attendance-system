"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  async function handleAttendance(type: "IN" | "OUT") {
    setMessage("Checking PIN...");

    // Find employee by PIN
    const { data: employee, error } = await supabase
      .from("employees")
      .select("*")
      .eq("pin", pin)
      .single();

    if (error || !employee) {
      setMessage("Invalid PIN");
      return;
    }

    // Save attendance
    const { error: attendanceError } = await supabase
      .from("attendance")
      .insert([
        {
          employee_id: employee.id,
          type: type,
        },
      ]);

    if (attendanceError) {
      setMessage("Failed to record attendance");
      return;
    }

    setMessage(`${employee.name} successfully timed ${type}`);

    setPin("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm rounded-2xl bg-zinc-900 p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Attendance System
        </h1>

        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN"
          className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-800 p-4 text-center text-2xl outline-none"
        />

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAttendance("IN")}
            className="rounded-xl bg-green-600 p-4 font-semibold"
          >
            Time In
          </button>

          <button
            onClick={() => handleAttendance("OUT")}
            className="rounded-xl bg-red-600 p-4 font-semibold"
          >
            Time Out
          </button>
        </div>

        {message && (
          <p className="mt-6 text-center text-sm text-zinc-300">{message}</p>
        )}
      </div>
    </main>
  );
}
