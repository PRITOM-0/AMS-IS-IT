import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileSpreadsheet, Printer, RotateCcw, Search } from "lucide-react";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "../env";

const PRINTER_EQUIPMENT = new Set([
  "printer",
  "pos printer",
  "photocopier",
  "photocopiers",
]);
const EMPTY_SEARCH = {
  assetCode: "",
  company: "",
  department: "",
  location: "",
};

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const currentPeriod = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

export default function PrinterReading() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState(EMPTY_SEARCH);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportPeriod, setReportPeriod] = useState(currentPeriod);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const fetchAssets = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/assets`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Unable to load assets.");

        const data = await response.json();
        if (isCurrent) setAssets(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (isCurrent) setError(fetchError.message || "Unable to load assets.");
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchAssets();
    return () => {
      isCurrent = false;
    };
  }, []);

  const printerAssets = useMemo(
    () =>
      assets.filter((asset) =>
        PRINTER_EQUIPMENT.has(normalize(asset.equipment)),
      ),
    [assets],
  );

  const filteredAssets = useMemo(() => {
    const assetCodeQuery = normalize(search.assetCode);
    const companyQuery = normalize(search.company);
    const departmentQuery = normalize(search.department);
    const locationQuery = normalize(search.location);

    return printerAssets.filter(
      (asset) =>
        normalize(asset.assetCode).includes(assetCodeQuery) &&
        normalize(asset.company).includes(companyQuery) &&
        normalize(asset.department).includes(departmentQuery) &&
        normalize(asset.location).includes(locationQuery),
    );
  }, [printerAssets, search]);

  const updateSearch = (field) => (event) => {
    setSearch((current) => ({ ...current, [field]: event.target.value }));
  };

  const exportMonthlyReport = async () => {
    setExporting(true);
    setExportError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/readings?period=${encodeURIComponent(reportPeriod)}`,
        { credentials: "include" },
      );
      if (!response.ok) throw new Error("Unable to load monthly readings.");
      const readings = await response.json();
      const readingsByAsset = new Map(
        readings.map((reading) => [String(reading.assetId), reading]),
      );
      const reportRows = filteredAssets.map((asset) => {
        const reading = readingsByAsset.get(String(asset._id));
        const bwStart = reading?.bwStartReading ?? reading?.startReading;
        const bwEnd = reading?.bwEndReading ?? reading?.endReading;
        const colorStart = reading?.colorStartReading;
        const colorEnd = reading?.colorEndReading;
        return {
          "Asset code": asset.assetCode || "",
          Equipment: asset.equipment || "",
          Brand: asset.brand || "",
          Model: asset.model || "",
          Company: asset.company || "",
          Department: asset.department || "",
          Location: asset.location || "",
          Month: reportPeriod,
          "B/W start reading": bwStart ?? "",
          "B/W end reading": bwEnd ?? "",
          "B/W usage":
            bwStart !== undefined && bwEnd !== undefined ? bwEnd - bwStart : "",
          "Color start reading": colorStart ?? "",
          "Color end reading": colorEnd ?? "",
          "Color usage":
            colorStart !== undefined && colorEnd !== undefined
              ? colorEnd - colorStart
              : "",
          Remarks: reading?.remarks || "",
          Status: asset.status || "",
        };
      });
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.json_to_sheet(reportRows);
      XLSX.utils.book_append_sheet(workbook, sheet, "Monthly readings");
      XLSX.writeFile(workbook, `printer-readings-${reportPeriod}.xlsx`);
    } catch (exportFailure) {
      setExportError(
        exportFailure.message || "Unable to export monthly readings.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Printer size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Printer readings
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {filteredAssets.length} of {printerAssets.length} printer assets
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="report-period">
              Report month
            </label>
            <input
              id="report-period"
              type="month"
              value={reportPeriod}
              onChange={(event) => setReportPeriod(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            />
            <button
              type="button"
              onClick={exportMonthlyReport}
              disabled={exporting || !filteredAssets.length || !reportPeriod}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileSpreadsheet size={16} />{" "}
              {exporting ? "Exporting..." : "Export monthly Excel"}
            </button>
            <button
              type="button"
              onClick={() => setSearch(EMPTY_SEARCH)}
              disabled={!Object.values(search).some(Boolean)}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={16} /> Clear search
            </button>
          </div>
        </header>

        {exportError && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {exportError}
          </p>
        )}

        <section
          aria-label="Search printer assets"
          className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            ["assetCode", "Asset code", "Search asset code"],
            ["company", "Company", "Search company"],
            ["department", "Department", "Search department"],
            ["location", "Location", "Search location"],
          ].map(([field, label, placeholder]) => (
            <label key={field} className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                {label}
              </span>
              <span className="relative block">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search[field]}
                  onChange={updateSearch(field)}
                  placeholder={placeholder}
                  className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </span>
            </label>
          ))}
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {loading ? (
            <p className="p-8 text-center text-sm text-slate-600">
              Loading printer assets...
            </p>
          ) : error ? (
            <p role="alert" className="p-8 text-center text-sm text-red-700">
              {error}
            </p>
          ) : filteredAssets.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-600">
              {printerAssets.length
                ? "No printer assets match your search."
                : "No printer assets found."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Asset code</th>
                    <th className="px-4 py-3 font-semibold">Equipment</th>
                    <th className="px-4 py-3 font-semibold">Brand / model</th>
                    <th className="px-4 py-3 font-semibold">Company</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Reading history</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAssets.map((asset) => (
                    <tr
                      key={asset._id}
                      className="text-slate-700 hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold">
                        <Link
                          to={`/assets/${asset._id}`}
                          className="text-indigo-700 hover:underline"
                        >
                          {asset.assetCode || "-"}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{asset.equipment || "-"}</td>
                      <td className="px-4 py-3">
                        {[asset.brand, asset.model]
                          .filter(Boolean)
                          .join(" / ") || "-"}
                      </td>
                      <td className="px-4 py-3">{asset.company || "-"}</td>
                      <td className="px-4 py-3">{asset.department || "-"}</td>
                      <td className="px-4 py-3">{asset.location || "-"}</td>
                      <td className="px-4 py-3">{asset.status || "-"}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/printer-readings/${asset._id}`}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-indigo-200 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                        >
                          <Printer size={14} /> Readings
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
