import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileSpreadsheet,
  Pencil,
  Plus,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "../env";

const currentPeriod = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

const formatPeriod = (year, month) =>
  `${year}-${String(month).padStart(2, "0")}`;

const formatMonth = (period) => {
  const [year, month] = period.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
};

const getErrorMessage = async (response) => {
  const data = await response.json().catch(() => ({}));
  return data.message || "Request failed.";
};

const readingRow = (asset, reading) => {
  const bwStart = reading.bwStartReading ?? reading.startReading ?? "";
  const bwEnd = reading.bwEndReading ?? reading.endReading ?? "";
  const colorStart = reading.colorStartReading ?? "";
  const colorEnd = reading.colorEndReading ?? "";

  return {
    "Asset code": asset.assetCode || "",
    Equipment: asset.equipment || "",
    Brand: asset.brand || "",
    Model: asset.model || "",
    Company: asset.company || "",
    Location: asset.location || "",
    Month: formatMonth(formatPeriod(reading.year, reading.month)),
    "B/W start reading": bwStart,
    "B/W end reading": bwEnd,
    "B/W usage": bwStart !== "" && bwEnd !== "" ? bwEnd - bwStart : "",
    "Color start reading": colorStart,
    "Color end reading": colorEnd,
    "Color usage":
      colorStart !== "" && colorEnd !== "" ? colorEnd - colorStart : "",
    Remarks: reading.remarks || "",
  };
};

export default function ReadingPage() {
  const { assetId } = useParams();
  const { user } = useOutletContext() || {};
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [asset, setAsset] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [period, setPeriod] = useState(currentPeriod);
  const [counters, setCounters] = useState({
    bwStartReading: "",
    bwEndReading: "",
    colorStartReading: "",
    colorEndReading: "",
  });
  const [remarks, setRemarks] = useState("");
  const [rangeStart, setRangeStart] = useState(currentPeriod);
  const [rangeEnd, setRangeEnd] = useState(currentPeriod);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [formError, setFormError] = useState("");
  const [printReadings, setPrintReadings] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    const loadData = async () => {
      try {
        const [assetResponse, readingsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/assets/${assetId}`, {
            credentials: "include",
          }),
          fetch(
            `${API_BASE_URL}/readings?assetId=${encodeURIComponent(assetId)}`,
            { credentials: "include" },
          ),
        ]);
        if (!assetResponse.ok)
          throw new Error(await getErrorMessage(assetResponse));
        if (!readingsResponse.ok)
          throw new Error(await getErrorMessage(readingsResponse));

        const [assetData, readingData] = await Promise.all([
          assetResponse.json(),
          readingsResponse.json(),
        ]);
        if (isCurrent) {
          setAsset(assetData);
          const loadedReadings = Array.isArray(readingData) ? readingData : [];
          const periods = loadedReadings
            .map((reading) => formatPeriod(reading.year, reading.month))
            .sort();
          setReadings(loadedReadings);
          setRangeStart(periods[0] || currentPeriod());
          setRangeEnd(currentPeriod());
        }
      } catch (error) {
        if (isCurrent)
          setPageError(
            error.message || "Unable to load printer reading history.",
          );
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    loadData();
    return () => {
      isCurrent = false;
    };
  }, [assetId]);

  useEffect(() => {
    if (!printReadings?.length) return undefined;

    const printTimer = window.setTimeout(() => window.print(), 0);
    const finishPrint = () => setPrintReadings(null);
    window.addEventListener("afterprint", finishPrint);
    return () => {
      window.clearTimeout(printTimer);
      window.removeEventListener("afterprint", finishPrint);
    };
  }, [printReadings]);

  const existingPeriod = useMemo(
    () =>
      readings.find(
        (reading) => formatPeriod(reading.year, reading.month) === period,
      ),
    [readings, period],
  );

  useEffect(() => {
    if (!modalOpen) return;
    const matchingReading = readings.find(
      (reading) => formatPeriod(reading.year, reading.month) === period,
    );
    if (!matchingReading) {
      setCounters({
        bwStartReading: "",
        bwEndReading: "",
        colorStartReading: "",
        colorEndReading: "",
      });
      setRemarks("");
      return;
    }
    setCounters({
      bwStartReading: String(
        matchingReading.bwStartReading ?? matchingReading.startReading ?? "",
      ),
      bwEndReading: String(
        matchingReading.bwEndReading ?? matchingReading.endReading ?? "",
      ),
      colorStartReading: String(matchingReading.colorStartReading ?? ""),
      colorEndReading: String(matchingReading.colorEndReading ?? ""),
    });
    setRemarks(matchingReading.remarks || "");
  }, [modalOpen, period, readings]);

  const selectedReadings = useMemo(() => {
    if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) return [];
    return readings
      .filter((reading) => {
        const readingPeriod = formatPeriod(reading.year, reading.month);
        return readingPeriod >= rangeStart && readingPeriod <= rangeEnd;
      })
      .sort(
        (first, second) =>
          first.year - second.year || first.month - second.month,
      );
  }, [readings, rangeStart, rangeEnd]);

  const openModal = (reading = null) => {
    setPeriod(
      reading ? formatPeriod(reading.year, reading.month) : currentPeriod(),
    );
    setCounters({
      bwStartReading: reading
        ? String(reading.bwStartReading ?? reading.startReading ?? "")
        : "",
      bwEndReading: reading
        ? String(reading.bwEndReading ?? reading.endReading ?? "")
        : "",
      colorStartReading: reading ? String(reading.colorStartReading ?? "") : "",
      colorEndReading: reading ? String(reading.colorEndReading ?? "") : "",
    });
    setRemarks(reading?.remarks || "");
    setFormError("");
    setModalOpen(true);
  };

  const updateCounter = (field) => (event) => {
    setCounters((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const response = await fetch(`${API_BASE_URL}/readings`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          period,
          bwStartReading: Number(counters.bwStartReading),
          bwEndReading: Number(counters.bwEndReading),
          colorStartReading: Number(counters.colorStartReading),
          colorEndReading: Number(counters.colorEndReading),
          remarks,
        }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const savedReading = await response.json();
      setReadings((current) =>
        [
          savedReading,
          ...current.filter((item) => item._id !== savedReading._id),
        ].sort((a, b) => b.year - a.year || b.month - a.month),
      );
      setModalOpen(false);
    } catch (error) {
      setFormError(error.message || "Unable to save this reading.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reading) => {
    const monthLabel = formatMonth(formatPeriod(reading.year, reading.month));
    if (
      !window.confirm(
        `Delete the ${monthLabel} reading for ${asset.assetCode || "this printer"}?`,
      )
    ) {
      return;
    }

    setDeletingId(reading._id);
    setDeleteError("");
    try {
      const response = await fetch(`${API_BASE_URL}/readings/${reading._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to delete this reading.");
      }
      setReadings((current) =>
        current.filter((item) => item._id !== reading._id),
      );
    } catch (error) {
      setDeleteError(error.message || "Unable to delete this reading.");
    } finally {
      setDeletingId("");
    }
  };

  const exportRange = () => {
    if (!selectedReadings.length) return;
    const rows = selectedReadings.map((reading) =>
      readingRow(reading.asset || asset, reading),
    );
    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Reading history");
    const assetCode = (asset.assetCode || "printer").replace(
      /[^a-z0-9_-]/gi,
      "-",
    );
    XLSX.writeFile(
      workbook,
      `${assetCode}-readings-${rangeStart}-to-${rangeEnd}.xlsx`,
    );
  };

  if (loading) {
    return (
      <main className="p-8 text-center text-sm text-slate-600">
        Loading reading history...
      </main>
    );
  }

  if (pageError || !asset) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {pageError || "Printer asset not found."}
        </p>
        <Link
          to="/printer-readings"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700"
        >
          <ArrowLeft size={16} /> Back to printers
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <style>{`
        .reading-print-sheet { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          .reading-print-sheet, .reading-print-sheet * { visibility: visible !important; }
          .reading-print-sheet { display: block !important; position: absolute; inset: 0; padding: 24px; background: white; color: black; }
        }
      `}</style>
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          to="/printer-readings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700"
        >
          <ArrowLeft size={16} /> Printer assets
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-bold uppercase text-indigo-700">
              Monthly meter history
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {asset.assetCode || "Printer"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {[
                asset.equipment,
                asset.brand,
                asset.model,
                asset.company,
                asset.location,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800"
          >
            <Plus size={17} /> Add monthly reading
          </button>
        </header>

        <section className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              From month
            </span>
            <input
              type="month"
              value={rangeStart}
              max={rangeEnd || undefined}
              onChange={(event) => setRangeStart(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              To month
            </span>
            <input
              type="month"
              value={rangeEnd}
              min={rangeStart || undefined}
              onChange={(event) => setRangeEnd(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <p className="mr-auto pb-2 text-sm text-slate-600">
            {selectedReadings.length} month
            {selectedReadings.length === 1 ? "" : "s"} in range
          </p>
          <button
            type="button"
            onClick={() => setPrintReadings(selectedReadings)}
            disabled={!selectedReadings.length}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer size={16} /> Print range
          </button>
          <button
            type="button"
            onClick={exportRange}
            disabled={!selectedReadings.length}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet size={16} /> Export range to Excel
          </button>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {deleteError && (
            <p
              role="alert"
              className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {deleteError}
            </p>
          )}
          {readings.length === 0 ? (
            <p className="p-10 text-center text-sm text-slate-600">
              No monthly readings have been recorded for this asset.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-260 border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Month</th>
                    <th className="px-4 py-3 font-semibold">B/W start</th>
                    <th className="px-4 py-3 font-semibold">B/W end</th>
                    <th className="px-4 py-3 font-semibold">B/W usage</th>
                    <th className="px-4 py-3 font-semibold">Color start</th>
                    <th className="px-4 py-3 font-semibold">Color end</th>
                    <th className="px-4 py-3 font-semibold">Color usage</th>
                    <th className="px-4 py-3 font-semibold">Remarks</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {readings.map((reading) => (
                    <tr
                      key={reading._id}
                      className="text-slate-700 hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-semibold">
                        {formatMonth(formatPeriod(reading.year, reading.month))}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {reading.bwStartReading ?? reading.startReading ?? "-"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {reading.bwEndReading ?? reading.endReading ?? "-"}
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums">
                        {(reading.bwEndReading ?? reading.endReading) !==
                        undefined
                          ? (reading.bwEndReading ?? reading.endReading) -
                            (reading.bwStartReading ?? reading.startReading)
                          : "-"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {reading.colorStartReading ?? "-"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {reading.colorEndReading ?? "-"}
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums">
                        {reading.colorStartReading !== undefined &&
                        reading.colorEndReading !== undefined
                          ? reading.colorEndReading - reading.colorStartReading
                          : "-"}
                      </td>
                      <td className="max-w-64 whitespace-pre-wrap px-4 py-3">
                        {reading.remarks || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Edit this month"
                            onClick={() => openModal(reading)}
                            className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-indigo-700"
                          >
                            <Pencil size={16} />
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              title="Delete this month"
                              aria-label={`Delete ${formatMonth(formatPeriod(reading.year, reading.month))} reading`}
                              disabled={deletingId === reading._id}
                              onClick={() => handleDelete(reading)}
                              className="rounded p-2 text-slate-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setModalOpen(false)
          }
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reading-modal-title"
            className="w-full max-w-2xl rounded-lg bg-white shadow-xl"
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2
                  id="reading-modal-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {existingPeriod
                    ? "Update monthly reading"
                    : "Add monthly reading"}
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  {asset.assetCode || asset.equipment}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="rounded p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </header>
            <form onSubmit={handleSave} className="space-y-4 p-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Month
                </span>
                <input
                  type="month"
                  required
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Black & white (B/W)",
                    start: "bwStartReading",
                    end: "bwEndReading",
                  },
                  {
                    title: "Color",
                    start: "colorStartReading",
                    end: "colorEndReading",
                  },
                ].map(({ title, start, end }) => (
                  <fieldset
                    key={title}
                    className="space-y-3 rounded-md border border-slate-200 p-4"
                  >
                    <legend className="px-1 text-sm font-bold text-slate-800">
                      {title}
                    </legend>
                    {[
                      [start, "Start reading"],
                      [end, "End reading"],
                    ].map(([field, label]) => (
                      <label key={field} className="block">
                        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                          {label}
                        </span>
                        <input
                          type="number"
                          min={field === end ? counters[start] || "0" : "0"}
                          step="any"
                          required
                          value={counters[field]}
                          onChange={updateCounter(field)}
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                      </label>
                    ))}
                  </fieldset>
                ))}
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Remarks
                </span>
                <textarea
                  rows={3}
                  maxLength={4000}
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Add a note for this month's reading"
                  className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              {formError && (
                <p role="alert" className="text-sm text-red-700">
                  {formError}
                </p>
              )}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : existingPeriod
                      ? "Update reading"
                      : "Save reading"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {printReadings?.length > 0 && (
        <article className="reading-print-sheet">
          <h1>Printer Reading History</h1>
          <p>
            <strong>Asset code:</strong>{" "}
            {printReadings[0].asset?.assetCode || asset.assetCode || "-"}
          </p>
          <p>
            <strong>Equipment:</strong>{" "}
            {printReadings[0].asset?.equipment || asset.equipment || "-"}
          </p>
          <p>
            <strong>Company:</strong>{" "}
            {printReadings[0].asset?.company || asset.company || "-"}
          </p>
          <p>
            <strong>Location:</strong>{" "}
            {printReadings[0].asset?.location || asset.location || "-"}
          </p>
          <p>
            <strong>Period:</strong> {formatMonth(rangeStart)} to{" "}
            {formatMonth(rangeEnd)}
          </p>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 24,
              fontSize: 12,
            }}
          >
            <thead>
              <tr>
                {[
                  "Month",
                  "B/W start",
                  "B/W end",
                  "B/W usage",
                  "Color start",
                  "Color end",
                  "Color usage",
                  "Remarks",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #222",
                      padding: 6,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {printReadings.map((reading) => {
                const bwStart =
                  reading.bwStartReading ?? reading.startReading ?? "";
                const bwEnd = reading.bwEndReading ?? reading.endReading ?? "";
                const colorStart = reading.colorStartReading ?? "";
                const colorEnd = reading.colorEndReading ?? "";
                return (
                  <tr key={reading._id}>
                    <td style={{ borderBottom: "1px solid #aaa", padding: 6 }}>
                      {formatMonth(formatPeriod(reading.year, reading.month))}
                    </td>
                    <td style={{ borderBottom: "1px solid #aaa", padding: 6 }}>
                      {bwStart}
                    </td>
                    <td style={{ borderBottom: "1px solid #aaa", padding: 6 }}>
                      {bwEnd}
                    </td>
                    <td style={{ borderBottom: "1px solid #aaa", padding: 6 }}>
                      {bwStart !== "" && bwEnd !== "" ? bwEnd - bwStart : ""}
                    </td>
                    <td style={{ borderBottom: "1px solid #aaa", padding: 6 }}>
                      {colorStart}
                    </td>
                    <td style={{ borderBottom: "1px solid #aaa", padding: 6 }}>
                      {colorEnd}
                    </td>
                    <td style={{ borderBottom: "1px solid #aaa", padding: 6 }}>
                      {colorStart !== "" && colorEnd !== ""
                        ? colorEnd - colorStart
                        : ""}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #aaa",
                        padding: 6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {reading.remarks || ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </article>
      )}
    </main>
  );
}
