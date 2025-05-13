import React, { useState } from 'react';

function ExecutionControlCard() {
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [frequency, setFrequency] = useState('Weekly');
  const [day, setDay] = useState('Monday');
  const [time, setTime] = useState('08:00');
  const [parallel, setParallel] = useState(1);
  const [languages, setLanguages] = useState([]);

  const handleSaveSchedule = () => {
    const payload = {
      scheduleEnabled,
      frequency,
      day,
      time,
      parallelExecution: parallel,
      selectedLanguages: languages,
    };
    console.log("Schedule saved:", payload);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {/* On-Demand Execution */}
      <div className="rounded-2xl shadow-md p-4 bg-white">
        <h2 className="text-xl font-semibold mb-4">▶️ On-Demand Execution</h2>
        <div className="mb-4">
          <label className="block font-medium mb-1">Parallel Execution</label>
          <input
            type="number"
            value={parallel}
            onChange={e => setParallel(parseInt(e.target.value, 10))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => alert("Not implemented yet")}>
            Run Selected Tests
          </button>
          <button onClick={() => alert("Not implemented yet")}>
            Run All Tests
          </button>
        </div>
      </div>

      {/* Scheduled Execution */}
      <div className="rounded-2xl shadow-md p-4 bg-white">
        <h2 className="text-xl font-semibold mb-4">📆 Scheduled Execution</h2>
        <div className="space-y-4">
          <label className="block">
            <input
              type="checkbox"
              checked={scheduleEnabled}
              onChange={() => setScheduleEnabled(!scheduleEnabled)}
              className="mr-2"
            />
            Enable Weekly Schedule
          </label>

          <div>
            <label className="block font-medium mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option>Weekly</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Day of Week</label>
            <select
              value={day}
              onChange={e => setDay(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Time (24h format)</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Parallel Execution</label>
            <input
              type="number"
              value={parallel}
              onChange={e => setParallel(parseInt(e.target.value, 10))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <button onClick={() => alert("Not implemented yet")}>
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExecutionControlCard;
