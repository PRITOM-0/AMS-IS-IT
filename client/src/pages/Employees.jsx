import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmployeeCard from "../components/EmployeeCard";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data));
  }, []);

  // 🔍 Filter logic
  const filteredEmployees = employees.filter((emp) => {
    return (
      emp.name.toLowerCase().includes(searchName.toLowerCase()) &&
      emp.employeeid.toLowerCase().includes(searchCode.toLowerCase()) &&
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
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Link
          to="/employees/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Employee
        </Link>
      </div>

      {/* 🔍 Search Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 grid md:grid-cols-4 gap-4">
        
        {/* Name Search */}
        <input
          type="text"
          placeholder="Search by Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Employee Code Search */}
        <input
          type="text"
          placeholder="Search by Employee Code"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Location Search */}
        <input
          type="text"
          placeholder="Search by Location"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded px-4 py-2"
        >
          Reset
        </button>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {filteredEmployees.map((emp) => (
          <EmployeeCard key={emp.id} employee={emp} />
        ))}
      </div>
    </div>
  );
}

export default Employees;