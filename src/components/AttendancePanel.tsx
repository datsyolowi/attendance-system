"use client";

import { Fingerprint, Delete, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export type RecordPayload = {
  name: string;
  id: string;
  time: Date;
};

export default function AttendancePanel({
  onRecord,
}: {
  onRecord?: (payload: RecordPayload) => void;
}) {
  const MAX = 6;

  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");
  const [shaking, setShaking] = useState(false);

  function press(digit: string) {
    if (pin.length < MAX) setPin((p) => p + digit);
  }

  function deleteLast() {
    setPin((p) => p.slice(0, -1));
  }

  function clear() {
    setPin("");
    setStatus(null);
    setMessage("");
  }

  function shake() {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }

  async function submit() {
    if (pin.length < MAX) {
      shake();
      return;
    }

    const { data: employee, error } = await supabase
      .from("employees")
      .select("*")
      .eq("pin", pin.trim())
      .maybeSingle();

    console.log("PIN:", pin);
    console.log("EMPLOYEE:", employee);
    console.log("ERROR:", error);

    if (!employee) {
      setStatus("error");
      setMessage("Invalid PIN.");

      setTimeout(() => {
        setPin("");
        setStatus(null);
        setMessage("");
      }, 3000);

      return;
    }

    const now = new Date();

    const today =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");

    const { data: attendance } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", employee.id)
      .eq("date", today)
      .maybeSingle();

    console.log("TODAY:", today);
    console.log("ATTENDANCE:", attendance);

    if (!attendance) {
      const { error: insertError } = await supabase.from("attendance").insert([
        {
          employee_id: employee.id,
          employee_name: employee.name,
          date: today,
          time_in: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        setStatus("error");
        setMessage("Failed to record Time In.");
        return;
      }

      setStatus("success");
      setMessage(`Welcome, ${employee.name}! Time In recorded.`);
    } else if (!attendance.time_out) {
      const { error: updateError } = await supabase
        .from("attendance")
        .update({
          time_out: new Date().toISOString(),
        })
        .eq("id", attendance.id);

      if (updateError) {
        setStatus("error");
        setMessage("Failed to record Time Out.");
        return;
      }

      setStatus("success");
      setMessage(`Goodbye, ${employee.name}! Time Out recorded.`);
    } else {
      setStatus("error");
      setMessage("Attendance already completed today.");

      setTimeout(() => {
        setPin("");
        setStatus(null);
        setMessage("");
      }, 3000);

      return;
    }

    onRecord?.({
      name: employee.name,
      id: String(employee.id),
      time: new Date(),
    });

    setTimeout(() => {
      setPin("");
      setStatus(null);
      setMessage("");
    }, 2500);
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-0">
      {/* Lock Icon */}
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-3xl">
          <LockKeyhole className="h-6 w-6 text-blue-300" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-[24px] font-bold leading-tight tracking-tight text-center text-white">
        Enter Your 6-Digit PIN
      </h2>

      {/* PIN Dots */}
      <div
        className="mt-5 flex gap-3"
        style={{ animation: shaking ? "shake 0.45s ease" : "none" }}
      >
        {Array.from({ length: MAX }).map((_, i) => (
          <div
            key={i}
            className={`
              h-3.5 w-3.5 rounded-full border transition-all duration-200
              ${
                i < pin.length
                  ? status === "error"
                    ? "border-red-400 bg-red-400"
                    : "border-blue-400 bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"
                  : "border-white/20 bg-white/[0.04]"
              }
            `}
          />
        ))}
      </div>

      {/* Subtitle */}
      <p className="mt-3 text-sm text-zinc-400">
        Use your PIN to record attendance
      </p>

      {/* Status */}
      <div className="mt-2 h-5 text-center">
        {message && (
          <p
            className={`text-xs font-medium ${
              status === "success" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="my-4 h-px w-full max-w-[320px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Keypad */}
      <div className="grid w-full max-w-[320px] grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => press(String(num))}
            className="
              rounded-[18px]
              border border-white/10
              bg-white/[0.05]
              p-3.5
              text-xl font-bold text-white
              shadow-[0_8px_20px_rgba(0,0,0,0.22)]
              backdrop-blur-3xl
              transition-all duration-200
              hover:border-blue-400/30 hover:bg-blue-500/10 hover:scale-[1.02]
              active:scale-[0.98]
            "
          >
            {num}
          </button>
        ))}

        <button
          onClick={clear}
          className="
            rounded-[18px]
            border border-red-500/20
            bg-red-500/10
            p-4
            text-sm font-bold text-red-300
            transition-all duration-200
            hover:bg-red-500/20 hover:scale-[1.02]
            active:scale-[0.98]
          "
        >
          Clear
        </button>

        <button
          onClick={() => press("0")}
          className="
            rounded-[18px]
            border border-white/10
            bg-white/[0.05]
            p-4
            text-xl font-bold text-white
            shadow-[0_8px_20px_rgba(0,0,0,0.22)]
            backdrop-blur-3xl
            transition-all duration-200
            hover:border-blue-400/30 hover:bg-blue-500/10 hover:scale-[1.02]
            active:scale-[0.98]
          "
        >
          0
        </button>

        <button
          onClick={deleteLast}
          className="
            flex items-center justify-center
            rounded-[18px]
            border border-white/10
            bg-white/[0.05]
            p-4
            shadow-[0_8px_20px_rgba(0,0,0,0.22)]
            backdrop-blur-3xl
            transition-all duration-200
            hover:border-blue-400/30 hover:bg-blue-500/10 hover:scale-[1.02]
            active:scale-[0.98]
          "
        >
          <Delete className="h-5 w-5 text-zinc-300" />
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={submit}
        disabled={status === "success"}
        className="
          mt-5
          flex w-full max-w-[320px] items-center justify-center gap-2
          rounded-[20px]
          bg-gradient-to-r from-blue-600 to-violet-600
          p-4
          text-sm font-bold tracking-widest text-white uppercase
          shadow-[0_16px_35px_rgba(59,130,246,0.32)]
          transition-all duration-300
          hover:scale-[1.01]
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        <Fingerprint className="h-4 w-4" />
        Record Attendance
      </button>

      <p className="mt-4 text-[10px] text-zinc-500">
        💡 Tip: Make sure to complete both Time In and Time Out
      </p>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
