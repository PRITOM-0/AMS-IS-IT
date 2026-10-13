
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../env";

export default function PrinterReading() {
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);

  const [search, setSearch] = useState({
    assetCode: "",
    company: "",
    location: "",
    department: "",
  });

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/assets`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load assets.");
        return res.json();
      })
      .then((data) =>
        setAssets(Array.isArray(data) ? data : data.assets || [])
      )
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  }, []);

  const printers = useMemo(() => {
    return assets.filter((asset) => {
      const equipment = String(
        asset.equipment || asset.equipmentName || ""
      )
        .trim()
        .toLowerCase();

      const isPrinter = [
        "printer",
        "pos printer",
        "photocopier",
      ].includes(equipment);

      return (
        isPrinter &&
        Object.keys(search).every((field) =>
          String(asset[field] || "")
            .toLowerCase()
            .includes(search[field].trim().toLowerCase())
        )
      );
    });
  }, [assets, search]);

  const allVisibleSelected =
    printers.length > 0 &&
    printers.every((asset) => selectedAssets.includes(asset._id));

  function reset() {
    setSearch({
      assetCode: "",
      company: "",
      location: "",
      department: "",
    });
  }

  function toggleAsset(id) {
    setSelectedAssets((prev) =>
      prev.includes(id)
        ? prev.filter((assetId) => assetId !== id)
        : [...prev, id]
    );
  }

  function toggleAllAssets() {
    const visibleIds = printers.map((asset) => asset._id);

    setSelectedAssets((prev) => {
      if (
        visibleIds.length > 0 &&
        visibleIds.every((id) => prev.includes(id))
      ) {
        return prev.filter((id) => !visibleIds.includes(id));
      }

      return [...new Set([...prev, ...visibleIds])];
    });
  }

  async function exportExcel() {
    if (!from || !to) {
      alert("Please select both From Month and To Month.");
      return;
    }

    if (from > to) {
      alert("From Month cannot be later than To Month.");
      return;
    }

    const visibleIds = new Set(printers.map((asset) => asset._id));
    const assetIds = selectedAssets.filter((id) => visibleIds.has(id));

    if (!assetIds.length) {
      alert("Please select at least one visible printer asset.");
      return;
    }

    setExporting(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/printer-reading/report`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ from, to, assetIds }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Export failed.");
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
    } catch (error) {
      alert(error.message || "Failed to export report.");
    } finally {
      setExporting(false);
    }
  }

  const inputClass =
    "w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100";

  const columns = [
    ["Asset Code", "assetCode"],
    ["Equipment", "equipment"],
    ["Brand", "brand"],
    ["Model", "model"],
    ["Serial", "serialNumber"],
    ["Company", "company"],
    ["Location", "location"],
    ["Department", "department"],
  ];

  function ReadingButton({ asset }) {
    return (
      <button
        onClick={() => navigate(`/printer-reading/${asset._id}`)}
        className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-blue-600 px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
      >
        Reading Info <span>→</span>
      </button>
    );
  }

  function AssetCheckbox({ asset }) {
    return (
      <input
        type="checkbox"
        checked={selectedAssets.includes(asset._id)}
        onChange={() => toggleAsset(asset._id)}
        aria-label={`Select ${asset.assetCode || "asset"}`}
        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-600"
      />
    );
  }

  function getAssetValue(asset, field) {
    if (field === "equipment") {
      return asset.equipment || asset.equipmentName || "";
    }

    return asset[field] || "";
  }

  return (
    <div className="min-h-screen space-y-4 bg-slate-50 p-3 sm:p-5">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
            Printer Monthly Readings
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Manage printer and photocopier counter readings.
          </p>
        </div>

        <span className="shrink-0 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
          {printers.length} Assets
        </span>
      </header>

      {/* Search and selection */}
      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Search Assets
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Select the assets to include in your Excel report.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleAllAssets}
                className="h-4 w-4 rounded accent-blue-600"
              />
              Select all ({printers.length})
            </label>

            <span className="text-xs font-semibold text-blue-700">
              Selected: {selectedAssets.length}
            </span>

            <button
              onClick={() => setSelectedAssets([])}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              Clear selection
            </button>

            <button
              onClick={reset}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              Reset filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {Object.keys(search).map((field) => (
            <input
              key={field}
              className={inputClass}
              placeholder={field.replace(/([A-Z])/g, " $1")}
              value={search[field]}
              onChange={(e) =>
                setSearch((prev) => ({
                  ...prev,
                  [field]: e.target.value,
                }))
              }
            />
          ))}
        </div>
      </section>

      {/* Export report */}
      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-slate-800">
            Export Monthly Report
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Export monthly B/W and color readings for selected assets.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="min-w-0 space-y-1.5 text-xs font-semibold text-slate-600">
            From Month
            <input
              type="month"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="min-w-0 space-y-1.5 text-xs font-semibold text-slate-600">
            To Month
            <input
              type="month"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={inputClass}
            />
          </label>

          <button
            onClick={exportExcel}
            disabled={exporting || loading}
            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1"
          >
            {exporting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Exporting...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3"
                  />
                </svg>
                Export Excel ({selectedAssets.filter((id) =>
                  printers.some((asset) => asset._id === id)
                ).length})
              </>
            )}
          </button>
        </div>
      </section>

      {/* Printer assets */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-3 sm:px-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Printer Assets
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Select assets and open their reading information.
            </p>
          </div>

          <span className="shrink-0 text-xs text-slate-400">
            {printers.length} records
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            Loading assets...
          </div>
        ) : printers.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No printer assets found
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Try changing your search filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block">
              <table className="w-full table-fixed text-left text-xs">
                <colgroup>
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "18%" }} />
                </colgroup>

                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-2 py-3">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAllAssets}
                        aria-label="Select all visible assets"
                        className="h-4 w-4 rounded accent-blue-600"
                      />
                    </th>

                    {[...columns, ["Action", "action"]].map(
                      ([heading]) => (
                        <th
                          key={heading}
                          className="break-words px-2 py-3 font-bold"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {printers.map((asset) => (
                    <tr
                      key={asset._id}
                      className="transition hover:bg-blue-50/50"
                    >
                      <td className="px-2 py-3 text-center">
                        <AssetCheckbox asset={asset} />
                      </td>

                      {columns.map(([heading, field]) => {
                        const value = getAssetValue(asset, field);

                        return (
                          <td
                            key={field}
                            title={String(value)}
                            className={`break-words px-2 py-3 align-middle text-slate-600 ${
                              field === "assetCode"
                                ? "font-semibold text-slate-800"
                                : ""
                            }`}
                          >
                            {value || "—"}
                          </td>
                        );
                      })}

                      <td className="px-2 py-2 align-middle">
                        <ReadingButton asset={asset} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile and tablet cards */}
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:hidden">
              {printers.map((asset) => (
                <article
                  key={asset._id}
                  className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-200 hover:bg-blue-50/30"
                >
                  <div className="mb-3 flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex min-w-0 items-start gap-2">
                      <div className="pt-0.5">
                        <AssetCheckbox asset={asset} />
                      </div>

                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold text-slate-800">
                          {asset.assetCode || "No asset code"}
                        </p>
                        <p className="mt-1 break-words text-xs text-slate-500">
                          {getAssetValue(asset, "equipment") || "—"}
                        </p>
                      </div>
                    </div>

                    <ReadingButton asset={asset} />
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                    {columns
                      .filter(
                        ([, field]) =>
                          !["assetCode", "equipment"].includes(field)
                      )
                      .map(([heading, field]) => (
                        <div key={field} className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            {heading}
                          </p>
                          <p className="mt-1 break-words text-xs text-slate-700">
                            {getAssetValue(asset, field) || "—"}
                          </p>
                        </div>
                      ))}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <footer className="border-t border-slate-100 bg-slate-50/70 px-3 py-3 sm:px-4">
          <p className="text-xs text-slate-500">
            Total printer assets:{" "}
            <strong className="text-slate-700">
              {printers.length}
            </strong>
            {" · "}
            Selected:{" "}
            <strong className="text-blue-700">
              {selectedAssets.filter((id) =>
                printers.some((asset) => asset._id === id)
              ).length}
            </strong>
          </p>
        </footer>
      </section>
    </div>
  );
}
