
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../env";
import axios from "axios";

const Log = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch Logs
  const fetchLogs = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE_URL}/logs`, {
        withCredentials: true,
      });

      setLogs(res.data);
    } catch (error) {
      console.error(
        "Failed to fetch logs:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Search Filter
  const filteredLogs = logs.filter((log) =>
    `
      ${log.performar || ""}
      ${log.on || ""}
      ${log.action || ""}
      ${log.employeename || ""}
      ${log.assetname || ""}
      ${log.assetcode || ""}
      ${log.username || ""}
      ${log.vendorname || ""}
    `
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">

      {/* Search and Refresh */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-center py-6 text-gray-500">
            Loading logs...
          </p>
        ) : filteredLogs.length === 0 ? (
          <p className="text-center py-6 text-gray-500">
            No logs found.
          </p>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log._id}
              className="border rounded-lg bg-white p-4"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-800">
                  {log.performar}
                </span>

                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    log.action === "CREATE"
                      ? "bg-green-100 text-green-700"
                      : log.action === "UPDATE"
                      ? "bg-blue-100 text-blue-700"
                      : log.action === "DELETE"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {log.action}
                </span>

                <span className="text-sm text-gray-500">
                  {log.on}
                </span>
              </div>

              {/* Details */}
              <div className="mt-3 space-y-1 text-sm text-gray-600">

                {log.employeename && (
                  <p>
                    <span className="font-medium">Employee:</span>{" "}
                    {log.employeename}
                  </p>
                )}

                {log.assetname && (
                  <p>
                    <span className="font-medium">Asset:</span>{" "}
                    {log.assetname}
                  </p>
                )}

                {log.assetcode && (
                  <p>
                    <span className="font-medium">Asset Code:</span>{" "}
                    {log.assetcode}
                  </p>
                )}

                {log.username && (
                  <p>
                    <span className="font-medium">Username:</span>{" "}
                    {log.username}
                  </p>
                )}

                {log.vendorname && (
                  <p>
                    <span className="font-medium">Vendor:</span>{" "}
                    {log.vendorname}
                  </p>
                )}

              </div>

              {/* Date */}
              <div className="text-xs text-gray-400 mt-3">
                {log.date
                  ? new Date(log.date).toLocaleString()
                  : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Log;
