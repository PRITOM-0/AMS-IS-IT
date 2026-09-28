import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmployeeCard from "../components/EmployeeCard";
import {
  Plus,
  Search,
  MapPin,
  RotateCcw,
  Users,
  Building2,
  BriefcaseBusiness,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../env";

function Employees() {
  const [employees, setEmployees] = useState([]);

  // Search
  const [search, setSearch] = useState("");

  // Dropdown filters
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCompany, setSearchCompany] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");

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

        const response = await axios.get(
          `${API_BASE_URL}/employees`,
          {
            withCredentials: true,
          }
        );

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
  // DROPDOWN OPTIONS
  // Get unique values from existing employees
  // --------------------------------------------------

  const locations = useMemo(() => {
    return [
      ...new Set(
        employees
          .map((emp) => emp.location)
          .filter(Boolean)
          .map((value) => String(value).trim())
      ),
    ].sort();
  }, [employees]);

  const companies = useMemo(() => {
    return [
      ...new Set(
        employees
          .map((emp) => emp.company)
          .filter(Boolean)
          .map((value) => String(value).trim())
      ),
    ].sort();
  }, [employees]);

  const departments = useMemo(() => {
    return [
      ...new Set(
        employees
          .map((emp) => emp.department)
          .filter(Boolean)
          .map((value) => String(value).trim())
      ),
    ].sort();
  }, [employees]);

  // --------------------------------------------------
  // SORT
  // Newest employee first
  // --------------------------------------------------

  const sortedEmployees = [...employees].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  );

  // --------------------------------------------------
  // FILTER
  // Search: Name + Designation + Employee ID
  // Dropdown: Location + Company + Department
  // --------------------------------------------------

  const filteredEmployees = sortedEmployees.filter((emp) => {
    const searchText = search.trim().toLowerCase();

    const employeeName = String(
      emp.employeeName || ""
    ).toLowerCase();

    const employeeId = String(
      emp.employeeId || ""
    ).toLowerCase();

    const designation = String(
      emp.designation || ""
    ).toLowerCase();

    const location = String(
      emp.location || ""
    ).toLowerCase();

    const company = String(
      emp.company || ""
    ).toLowerCase();

    const department = String(
      emp.department || ""
    ).toLowerCase();

    // Search one input across name, ID and designation
    const matchesSearch =
      !searchText ||
      employeeName.includes(searchText) ||
      employeeId.includes(searchText) ||
      designation.includes(searchText);

    // Dropdown filters
    const matchesLocation =
      !searchLocation ||
      location === searchLocation.toLowerCase();

    const matchesCompany =
      !searchCompany ||
      company === searchCompany.toLowerCase();

    const matchesDepartment =
      !searchDepartment ||
      department === searchDepartment.toLowerCase();

    return (
      matchesSearch &&
      matchesLocation &&
      matchesCompany &&
      matchesDepartment
    );
  });

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  const handleReset = () => {
    setSearch("");
    setSearchLocation("");
    setSearchCompany("");
    setSearchDepartment("");
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
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

            {/* FILTER HEADER */}
            <div className="mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-indigo-500" />

              <span className="text-sm font-bold text-slate-700">
                Search Employees
              </span>

              <span className="ml-auto rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                {filteredEmployees.length} Results
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">

              {/* SEARCH: NAME / DESIGNATION / ID */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search name, designation or ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-[42px] w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                />
              </div>

              {/* LOCATION */}
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="h-[42px] w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">All Locations</option>

                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* COMPANY */}
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={searchCompany}
                  onChange={(e) => setSearchCompany(e.target.value)}
                  className="h-[42px] w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">All Companies</option>

                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              {/* DEPARTMENT */}
              <div className="relative">
                <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={searchDepartment}
                  onChange={(e) =>
                    setSearchDepartment(e.target.value)
                  }
                  className="h-[42px] w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">All Departments</option>

                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* RESET */}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="flex h-[38px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
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
        <div className="overflow-x-auto rounded-xl border border-indigo-200 shadow-sm">
          <table className="w-full border-collapse bg-white text-left">
            <thead className="border-b border-indigo-200 bg-gradient-to-r from-indigo-100 via-white to-violet-100 text-xs font-semibold uppercase text-indigo-700">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-right">Assets</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-indigo-100">
              {filteredEmployees.map((emp) => (
                <EmployeeCard
                  key={emp._id}
                  employee={emp}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Employees;