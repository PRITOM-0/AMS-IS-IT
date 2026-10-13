
import { useEffect, useState } from "react";

const emptyForm = {
  month: new Date().toISOString().slice(0, 7), // Format: YYYY-MM
  year: new Date().getFullYear(),
  bwStart: "",
  bwEnd: "",
  colorStart: "",
  colorEnd: "",
  remarks: "",
};

const fields = [
  ["bwStart", "B/W Start"],
  ["bwEnd", "B/W End"],
  ["colorStart", "Color Start"],
  ["colorEnd", "Color End"],
];

export default function ReadingModal({
  assetId,
  reading,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (reading) {
      // Supports a monthly subdocument from monthlyReading
      const monthIndex = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December",
      ].indexOf(reading.month);

      setForm({
        month:
          monthIndex >= 0
            ? `${reading.year}-${String(monthIndex + 1).padStart(2, "0")}`
            : reading.month || "",
        year: reading.year || new Date().getFullYear(),
        bwStart: reading.bwStart ?? "",
        bwEnd: reading.bwEnd ?? "",
        colorStart: reading.colorStart ?? "",
        colorEnd: reading.colorEnd ?? "",
        remarks: reading.remarks || "",
      });
    } else {
      setForm({
        ...emptyForm,
        year: new Date().getFullYear(),
      });
    }

    setError("");
  }, [reading]);

  function change(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    const numbers = ["bwStart", "bwEnd", "colorStart", "colorEnd"];

    const invalid = numbers.some(
      (key) =>
        form[key] === "" ||
        !Number.isFinite(Number(form[key])) ||
        Number(form[key]) < 0
    );

    if (
      !form.month ||
      invalid ||
      Number(form.bwEnd) < Number(form.bwStart) ||
      Number(form.colorEnd) < Number(form.colorStart)
    ) {
      setError("Check the month and counter values.");
      return;
    }

    const [year, month] = form.month.split("-").map(Number);

    if (!year || !month || month < 1 || month > 12) {
      setError("Please select a valid month.");
      return;
    }

    setSaving(true);

    try {
      const result = await onSave({
        ...(reading?._id ? { id: reading._id } : {}),
        assetId,
        month: form.month,
        year,
        bwStart: Number(form.bwStart),
        bwEnd: Number(form.bwEnd),
        colorStart: Number(form.colorStart),
        colorEnd: Number(form.colorEnd),
        remarks: form.remarks || "",
      });

      if (result) onClose();
      else setError("Could not save. This month may already exist.");
    } catch (err) {
      setError(err.message || "Failed to save reading.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <form
        onSubmit={submit}
        className="my-auto w-full max-w-lg space-y-4 rounded-xl bg-white p-5 shadow-xl"
      >
        <h2 className="text-lg font-bold">
          {reading ? "Edit Monthly Reading" : "Add Monthly Reading"}
        </h2>

        <label className="block text-sm font-medium">
          Month
          <input
            type="month"
            name="month"
            value={form.month}
            onChange={change}
            required
            className="mt-1 w-full rounded-lg border p-2.5"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          {fields.map(([name, label]) => (
            <label key={name} className="text-sm font-medium">
              {label}
              <input
                type="number"
                min="0"
                step="1"
                name={name}
                value={form[name]}
                onChange={change}
                required
                className="mt-1 w-full rounded-lg border p-2.5"
              />
            </label>
          ))}
        </div>

        <label className="block text-sm font-medium">
          Remarks
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={change}
            rows={3}
            className="mt-1 w-full rounded-lg border p-2.5"
          />
        </label>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border px-4 py-2"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Reading"}
          </button>
        </div>
      </form>
    </div>
  );
}
