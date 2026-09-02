 
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmployeeCard from "../components/EmployeeCard";
import {
  Plus,
  Search,
  MapPin,
  RotateCcw,
  Users,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../env";

function Employees() {
  const [employees, setEmployees] = useState([]);

  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH EMPLOYEES
  // --------------------------------------------------

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_BASE_URL}/employees`);

        setEmployees(response.data || []);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        setError("Failed to load employees.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // --------------------------------------------------
  // SORT
  // Newest employee first
  // --------------------------------------------------

  const sortedEmployees = [...employees].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredEmployees = sortedEmployees.filter((emp) => {
    const employeeName = String(emp.employeeName || "").toLowerCase();
    const employeeId = String(emp.employeeId || "").toLowerCase();
    const location = String(emp.location || "").toLowerCase();

    return (
      employeeName.includes(searchName.toLowerCase()) &&
      employeeId.includes(searchId.toLowerCase()) &&
      location.includes(searchLocation.toLowerCase())
    );
  });

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  const handleReset = () => {
    setSearchName("");
    setSearchId("");
    setSearchLocation("");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* HEADER */}
      <div className="mb-5 rounded-[28px] border border-indigo-200 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-6 shadow-[0_20px_45px_-20px_rgba(79,70,229,0.45)]">
        <div className="flex flex-col gap-5">

          {/* TITLE */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Users className="h-5 w-5" />
                </div>

                <span className="text-sm font-semibold text-indigo-600">
                  Employee Management
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Employees
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage employees and their assigned company assets.
              </p>
            </div>

            {/* ADD EMPLOYEE */}
            <Link
              to="/employees/add"
              className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-400 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-600"
            >
              <Plus className="h-5 w-5" />
              Add Employee
            </Link>
          </div>

          {/* SEARCH FILTERS */}
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-indigo-500" />

              <span className="text-sm font-bold text-slate-700">
                Search Employees
              </span>

              <span className="ml-auto rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                {filteredEmployees.length} Results
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">

              {/* NAME */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search by Employee Name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="h-[42px] w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                />
              </div>

              {/* EMPLOYEE ID */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search by Employee ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="h-[42px] w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                />
              </div>

              {/* LOCATION */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search by Location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="h-[42px] w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                />
              </div>

              {/* RESET */}
              <button
                type="button"
                onClick={handleReset}
                className="flex h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
        </div>
      ) : filteredEmployees.length === 0 ? (
        /* EMPTY */
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Users className="h-6 w-6" />
          </div>

          <h3 className="font-semibold text-slate-700">
            No employees found
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Try changing your search filters.
          </p>
        </div>
      ) : (
        /* EMPLOYEE LIST */
        <div className="grid grid-cols-4">
          {filteredEmployees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Employees;
 
