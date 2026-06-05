"use client";

import { useState } from "react";
import Layout from "../components/Layout";
import WelcomePanel from "../components/WelcomePanel";
import AttendancePanel, {
  type RecordPayload,
} from "../components/AttendancePanel";
import RightWidgets, { type ActivityItem } from "../components/RightWidgets";

export default function Home() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  function handleRecord({ name, time }: RecordPayload) {
    const last = [...activity].reverse().find((a) => a.name === name);

    const type: "Time In" | "Time Out" =
      !last || last.type === "Time Out" ? "Time In" : "Time Out";

    setActivity((prev) => [
      ...prev,
      {
        name,
        type,
        time,
      },
    ]);
  }

  return (
    <Layout
      left={<WelcomePanel />}
      center={<AttendancePanel onRecord={handleRecord} />}
      right={<RightWidgets activity={activity} />}
    />
  );
}
