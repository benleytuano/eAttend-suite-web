import { useState, useEffect } from "react";

export default function CheckInPage() {
  const [eventCode, setEventCode] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [eventError, setEventError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("event");

    if (!code) {
      setEventError("No event code provided");
      setLoading(false);
      return;
    }

    setEventCode(code);
    setEventName(`Event: ${code}`);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (message?.type === "success") {
      const timer = setTimeout(() => {
        setEmployeeNumber("");
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleEmployeeNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 5);
    setEmployeeNumber(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeNumber.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your employee number",
      });
      return;
    }

    const fullEmployeeId = `03-${employeeNumber}`;
    setSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: eventCode,
          employee_id: fullEmployeeId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `✓ Successfully logged attendance! Welcome ${data.name}`,
        });
      } else {
        setMessage({
          type: "error",
          text: data.error,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Connection failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="h-8 w-8 border-4 border-slate-300 border-t-blue-600 rounded-full"></div>
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (eventError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Event Not Found
          </h1>
          <p className="text-slate-600">{eventError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <img src="/hrmd_logo.png" alt="Logo" className="h-32 mb-8" />

      {/* Attendance Title */}
      <h1 className="text-xl font-normal text-slate-800 mb-12 tracking-tight">
        Attendance
      </h1>

      <div className="w-full max-w-md">
        <div className="mb-6">
          <p className="text-sm text-slate-500 mb-6">
            Enter your employee number
          </p>

          <div className="flex items-center border-b border-slate-200 focus-within:border-blue-600 transition-all">
            <div className="text-slate-400 font-medium text-sm">03-</div>
            <input
              id="employeeNumber"
              type="text"
              inputMode="numeric"
              value={employeeNumber}
              onChange={handleEmployeeNumberChange}
              placeholder="00001"
              disabled={submitting}
              autoFocus
              onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
              className="flex-1 px-3 py-3 border-none focus:outline-none text-base font-mono disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
            />
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded-md text-sm font-medium mb-6 ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full py-2.5 px-3 rounded-md font-medium text-sm transition-all ${
            submitting
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
          }`}
        >
          {submitting ? "Processing..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
