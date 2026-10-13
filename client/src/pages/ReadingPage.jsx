
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReadingModal from "../components/ReadingModal";
import { API_BASE_URL } from "../env";

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ReadingPage() {
  const { assetId } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [readings, setReadings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = useCallback(async () => {
    if (!assetId) {
      setError("Asset ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/printer-reading/${assetId}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load readings.");
      }

      // Controller returns { assetId: assetObject, monthlyReading: [] }
      setAsset(data.assetId || null);
      setReadings(
        Array.isArray(data.monthlyReading) ? data.monthlyReading : []
      );
      setError("");
    } catch (err) {
      setError(err.message || "Could not load readings.");
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(formData) {
    const monthlyId = editing?._id;

    const url = monthlyId
      ? `${API_BASE_URL}/printer-reading/${monthlyId}`
      : `${API_BASE_URL}/printer-reading`;

    try {
      const res = await fetch(url, {
        method: monthlyId ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          assetId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Unable to save reading.");
        return false;
      }

      await load();
      return true;
    } catch {
      alert("Server connection failed.");
      return false;
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this monthly reading?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/printer-reading/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Unable to delete reading.");
        return;
      }

      await load();
    } catch {
      alert("Server connection failed.");
    }
  }

 
async function exportExcel() {
  if (!from || !to) {
    alert("Please select both From Month and To Month.");
    return;
  }

  if (from > to) {
    alert("From month cannot be later than To month.");
    return;
  }

  const params = new URLSearchParams({
    assetId,
    from,
    to,
  });

  try {
    const res = await fetch(
      `${API_BASE_URL}/printer-reading/export?${params}`,
      { credentials: "include" }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Excel export failed.");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `printer-reading-${from}-to-${to}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    alert(err.message || "Excel export failed.");
  }
}


  const openAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (reading) => {
    setEditing(reading);
    setShowModal(true);
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "—";

  return (
    <div className="min-h-screen min-w-[1100px] space-y-5 bg-slate-100 p-6 text-slate-800">
      {/* Header */}
      <header className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/printer-reading")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
          >
            ← Back
          </button>

          <div>
            <h1 className="text-2xl font-bold">
              Monthly Printer Readings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage black-and-white and color counter readings.
            </p>
          </div>
        </div>

        <button
          onClick={openAdd}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add Reading
        </button>
      </header>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button onClick={load} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Asset Information */}
      {asset && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Asset Information</h2>

          <div className="grid grid-cols-4 gap-x-8 gap-y-5">
            {[
              ["Asset Code", asset.assetCode],
              ["Equipment", asset.equipment || asset.equipmentName],
              ["Brand", asset.brand],
              ["Model", asset.model],
              ["Serial Number", asset.serialNumber],
              ["Company", asset.company],
              ["Location", asset.location],
              ["Department", asset.department],
              ["Status", asset.status],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  {label}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {value || "—"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Export */}
      <section className="flex items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mr-auto">
          <h2 className="font-bold">Export Monthly Report</h2>
          <p className="mt-1 text-sm text-slate-500">
            Export readings for the selected period.
          </p>
        </div>

        <label className="w-48 text-sm font-medium">
          From Month
          <input
            type="month"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </label>

        <label className="w-48 text-sm font-medium">
          To Month
          <input
            type="month"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </label>

        <button
          onClick={exportExcel}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Export Excel
        </button>
      </section>

      {/* Reading History */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-bold">Reading History</h2>
            <p className="mt-1 text-sm text-slate-500">
              Monthly readings for this asset.
            </p>
          </div>

          <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold">
            {readings.length} Records
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Loading readings...
          </div>
        ) : readings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold">No readings recorded</p>
            <p className="mt-2 text-sm text-slate-500">
              Add a monthly reading to get started.
            </p>
            <button
              onClick={openAdd}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              + Add First Reading
            </button>
          </div>
        ) : (
          <table className="w-full table-fixed text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {[
                  ["Month", "10%"],
                  ["B/W Start", "10%"],
                  ["B/W End", "10%"],
                  ["B/W Total", "10%"],
                  ["Color Start", "10%"],
                  ["Color End", "10%"],
                  ["Color Total", "10%"],
                  ["Remarks", "10%"],
                  ["Date", "10%"],
                  ["Actions", "15%"],
                ].map(([label, width]) => (
                  <th
                    key={label}
                    style={{ width }}
                    className="px-2 py-2 font-semibold text-center"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {readings.map((r) => (
                <tr key={r._id} className="hover:bg-blue-50/50">
                  <td className="px-2 py-2 font-semibold text-center">
                    {r.month} {r.year}
                  </td>
                  <td className="px-4 py-4 text-center">{r.bwStart ?? 0}</td>
                  <td className="px-4 py-4 text-center">{r.bwEnd ?? 0}</td>
                  <td className="px-4 py-4 text-center font-bold text-blue-900">{r.bwEnd - r.bwStart}</td>
                  <td className="px-4 py-4 text-center">{r.colorStart ?? 0}</td>
                  <td className="px-4 py-4 text-center">{r.colorEnd ?? 0}</td>
                  <td className="px-4 py-4 text-center font-bold text-blue-900">{r.colorEnd - r.colorStart}</td>
                  <td className="break-words px-4 py-4">
                    {r.remarks || "—"}
                  </td>
                  <td className="px-4 py-4">{formatDate(r.date)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(r._id)}
                        className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <footer className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-500">
          Total readings: {readings.length}
        </footer>
      </section>

      {showModal && (
        <ReadingModal
          assetId={assetId}
          reading={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={save}
        />
      )}
    </div>
  );
}
