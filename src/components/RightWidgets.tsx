"use client";

import {
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Users,
  Clock3,
  BarChart2,
  Download,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export type ActivityItem = {
  name: string;
  type: "Time In" | "Time Out";
  time: Date;
};

const QUOTES = [
  {
    text: "Discipline is doing what needs to be done, even when you don't want to.",
    author: "Jocko Willink",
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
  },
  { text: "Show up. Every single day.", author: "Unknown" },
];

function fmt(d: Date) {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${m} ${ap}`;
}

async function exportToExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance Report");

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("date", todayStr)
    .order("employee_name");

  if (error || !data) {
    console.error(error);
    return;
  }

  const dateStr = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const attendanceRows = data.map((row) => ({
    employee: row.employee_name,
    timeIn: row.time_in ? fmt(new Date(row.time_in)) : "",
    timeOut: row.time_out ? fmt(new Date(row.time_out)) : "",
    date: new Date(row.date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  }));
  // Title
  sheet.mergeCells("A1:D1");

  const title = sheet.getCell("A1");
  title.value = "ATTENDANCE REPORT";

  title.font = {
    bold: true,
    size: 16,
    color: { argb: "FFFFFF" },
  };

  title.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  title.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "1E3A8A" },
  };

  sheet.getRow(1).height = 28;

  // Date
  sheet.mergeCells("A2:D2");

  const reportDate = sheet.getCell("A2");
  reportDate.value = dateStr;

  reportDate.font = {
    size: 11,
    color: { argb: "666666" },
  };

  reportDate.alignment = {
    horizontal: "center",
  };

  // Headers
  const headerRow = sheet.addRow(["Employee", "Time In", "Time Out", "Date"]);

  headerRow.height = 24;

  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "FFFFFF" },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "2563EB" },
    };

    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };
  });

  attendanceRows.forEach((item, index) => {
    const row = sheet.addRow([
      item.employee,
      item.timeIn,
      item.timeOut,
      item.date,
    ]);

    row.eachCell((cell) => {
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
    });

    // Zebra rows
    if (index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F8FAFC" },
        };
      });
    }
  });

  sheet.columns = [{ width: 30 }, { width: 18 }, { width: 18 }, { width: 24 }];

  sheet.views = [
    {
      state: "frozen",
      ySplit: 3,
    },
  ];

  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(
    new Blob([buffer]),
    `attendance_${today.toISOString().slice(0, 10)}.xlsx`,
  );
}

export default function RightWidgets({ activity = [] }: { activity?: any[] }) {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [timedOutCount, setTimedOutCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [showReports, setShowReports] = useState(false);

  useEffect(() => {
    loadEmployeeCount();
    loadRecentActivity();

    const interval = setInterval(() => {
      loadEmployeeCount();
      loadRecentActivity();
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  async function loadEmployeeCount() {
    const { count } = await supabase.from("employees").select("*", {
      count: "exact",
      head: true,
    });

    setEmployeeCount(count ?? 0);

    const today = new Date().toISOString().split("T")[0];

    const { count: presentToday } = await supabase
      .from("attendance")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("date", today);

    setPresentCount(presentToday ?? 0);

    const { count: timedOutToday } = await supabase
      .from("attendance")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("date", today)
      .not("time_out", "is", null);

    setTimedOutCount(timedOutToday ?? 0);
  }

  async function loadRecentActivity() {
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("date", today)
      .order("id", { ascending: false })
      .limit(3);

    setRecentActivity(data ?? []);
  }

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const quote = QUOTES[today.getDate() % QUOTES.length];
  const displayed = recentActivity;
  const uniqueEmployees = new Set(activity.map((a) => a.name));

  const presentEmployees = new Set(
    activity.filter((a) => a.type === "Time In").map((a) => a.name),
  );

  const timedOutEmployees = new Set(
    activity.filter((a) => a.type === "Time Out").map((a) => a.name),
  );

  return (
    // h-full + flex-col so the 4 cards together fill the panel height
    <div className="flex h-full flex-col gap-1.5">
      {/* Secure & Private — flex-1 so all 4 cards share height equally */}
      <div className="flex flex-1 flex-col justify-center rounded-[16px] border border-white/10 bg-white/[0.05] px-3 py-2.5 backdrop-blur-3xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-[0_4px_14px_rgba(99,102,241,0.35)]">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Secure & Private</h3>
            <p className="text-[10px] leading-snug text-zinc-400">
              Your data is encrypted and protected
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="relative flex flex-1 flex-col overflow-visible rounded-[16px] border border-white/10 bg-white/[0.05] px-3 py-2.5 backdrop-blur-3xl">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white">Recent Activity</h3>
          <button className="text-[10px] text-violet-400 transition hover:text-violet-300">
            View All
          </button>
        </div>

        <div className="space-y-1">
          {displayed.length === 0 && (
            <p className="py-1 text-[10px] text-zinc-500">No activity yet.</p>
          )}
          {displayed.map((person, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-[11px] border border-white/5 bg-black/20 px-2 py-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-[10px] font-bold text-white">
                  {person.employee_name.charAt(0)}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white leading-tight">
                    {person.employee_name}
                  </p>
                  <p
                    className={`text-[9px] ${
                      !person.time_out ? "text-blue-400" : "text-violet-400"
                    }`}
                  >
                    {person.time_out ? "Time Out" : "Time In"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <p className="text-[9px] text-zinc-400">
                  {fmt(new Date(person.time_out ?? person.time_in))}
                </p>
                {!person.time_out ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 text-violet-400" />
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="mt-auto pt-2 flex items-center gap-1 text-[10px] text-blue-400 transition hover:text-blue-300">
          View all activity
          <ArrowUpRight className="h-2.5 w-2.5" />
        </button>
      </div>

      {/* Daily Overview */}
      <div className="flex flex-1 flex-col rounded-[16px] border border-white/10 bg-white/[0.05] px-3 py-2.5 backdrop-blur-3xl">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BarChart2 className="h-3 w-3 text-blue-400" />
            <h3 className="text-xs font-bold text-white">Daily Overview</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <p className="text-[9px] text-zinc-400">{dateLabel}</p>
            <div className="relative">
              <button
                onClick={() => setShowReports(!showReports)}
                className="
      flex items-center gap-1 rounded-[6px]
      border border-violet-500/30 bg-violet-500/10
      px-1.5 py-0.5 text-[9px] font-semibold text-violet-400
      transition hover:bg-violet-500/20 hover:text-violet-300
      active:scale-95
    "
              >
                <Download className="h-2.5 w-2.5" />
                Reports ▼
              </button>

              {showReports && (
                <div
                  className="
                  absolute
                  right-0
                  top-9
                  z-[9999]
                  w-56
                  overflow-hidden
                  rounded-xl
                  border border-white/10
                  bg-[#12152b]/95
                  backdrop-blur-xl
                  shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                "
                >
                  <button
                    onClick={() => {
                      exportToExcel();
                      setShowReports(false);
                    }}
                    className="
                    w-full
                    px-4
                    py-3
                    text-left
                    text-sm
                    text-white
                    transition
                    hover:bg-white/5
                  "
                  >
                    Export Today
                  </button>

                  <button
                    onClick={() => {
                      console.log("Export Week");
                      setShowReports(false);
                    }}
                    className="
                    w-full
                    px-4
                    py-3
                    text-left
                    text-sm
                    text-white
                    transition
                    hover:bg-white/5
                  "
                  >
                    Export This Week
                  </button>

                  <button
                    onClick={() => {
                      console.log("Export Month");
                      setShowReports(false);
                    }}
                    className="
                    w-full
                    px-4
                    py-3
                    text-left
                    text-sm
                    text-white
                    transition
                    hover:bg-white/5
                  "
                  >
                    Export This Month
                  </button>

                  <div className="border-t border-white/10" />

                  <button
                    onClick={() => {
                      console.log("View Records");
                      setShowReports(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-violet-300 hover:bg-white/5"
                  >
                    View Records
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* my-auto centers the stat grid vertically in the extra space */}
        <div className="my-auto grid grid-cols-3 gap-1.5">
          {[
            {
              icon: Users,
              value: String(employeeCount),
              label: "Total Employees",
              bg: "bg-blue-500/20",
              color: "text-blue-400",
            },
            {
              icon: CheckCircle2,
              value: String(presentCount),
              label: "Present",
              bg: "bg-emerald-500/20",
              color: "text-emerald-400",
            },
            {
              icon: Clock3,
              value: String(timedOutCount),
              label: "Timed Out",
              bg: "bg-yellow-500/20",
              color: "text-yellow-400",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[11px] border border-white/5 bg-black/20 py-2 text-center"
            >
              <div
                className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full ${item.bg}`}
              >
                <item.icon className={`h-3 w-3 ${item.color}`} />
              </div>
              <p className="mt-1 text-sm font-black text-white">{item.value}</p>
              <p className="text-[8.5px] leading-tight text-zinc-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quote Card */}
      <div className="relative flex flex-1 flex-col justify-center rounded-[16px] border border-white/10 bg-white/[0.05] px-3 py-2 backdrop-blur-3xl">
        <span className="text-base font-black text-blue-400 leading-none">
          "
        </span>
        <p className="mt-0.5 pr-3 text-[10px] leading-relaxed text-zinc-300 italic">
          {quote.text}
        </p>
        <p className="mt-1 text-[9px] text-zinc-500">— {quote.author}</p>
        <span className="absolute bottom-2 right-2.5 text-base font-black text-blue-400 leading-none">
          "
        </span>
      </div>
    </div>
  );
}
