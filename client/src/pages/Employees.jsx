import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmployeeCard from "../components/EmployeeCard";
import { Plus } from "lucide-react";
import { API_BASE_URL } from "../env";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/employees`)
      .then((res) => res.json())
      .then((data) => setEmployees(data));
  }, []);

  //sort employees by createdAt date, newest first
  const sortedEmployees = [...employees].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  // 🔍 Filter logic
  const filteredEmployees = sortedEmployees.filter((emp) => {
    return (
      emp.name.toLowerCase().includes(searchName.toLowerCase()) &&
      emp.employeeCode.toLowerCase().includes(searchCode.toLowerCase()) &&
      emp.location.toLowerCase().includes(searchLocation.toLowerCase())
    );
  });

  // 🔄 Reset function
  const handleReset = () => {
    setSearchName("");
    setSearchCode("");
    setSearchLocation("");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="rounded-[28px] mb-5 border border-indigo-200 border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-6 shadow-[0_20px_45px_-20px_rgba(79,70,229,0.45)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between ">
          <div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Employee Management
            </h1>
            <p className="mt-2 mb-2 text-sm text-slate-500">
              Real-time status of company hardware, inventory, and staff access.
            </p>
          </div>

          <Link
            to="/employees/add"
            className="flex items-center space-x-3 rounded-2xl border border-emerald-400 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            <Plus size={18} /> Add Employee
          </Link>
        </div>
        {/* 🔍 Search Filters */}
        <div className="bg-white p-4 rounded-xl shadow grid md:grid-cols-4 gap-4 ">
          {/* Name Search */}
          <input
            type="text"
            placeholder="Search by Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
          />

          {/* Employee Code Search */}
          <input
            type="text"
            placeholder="Search by Employee Code"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
          />

          {/* Location Search */}
          <input
            type="text"
            placeholder="Search by Location"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
          />

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="h-[42px] text-black border border-gray-500 bg-gray-300 rounded px-4 hover:bg-gray-400 transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-2 gap-4">
        {filteredEmployees.map((emp) => (
          <EmployeeCard key={emp.id} employee={emp} />
        ))}
      </div>
    </div>
  );
}

export default Employees;
