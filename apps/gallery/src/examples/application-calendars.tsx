import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [date, setDate] = useState("2026-09-14");
  const [view, setView] = useState<UI.EventCalendarView>("month");
  return (
    <UI.EventCalendar
      testId="example"
      date={date}
      onDateChange={setDate}
      view={view}
      onViewChange={setView}
      width={600}
      height={400}
      events={[
        {
          id: "review",
          title: "Design review",
          date: "2026-09-14",
          startTime: "10:00",
          endTime: "11:00",
        },
      ]}
      onEventPress={() => {}}
    />
  );
}
