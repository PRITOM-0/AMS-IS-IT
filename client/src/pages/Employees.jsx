import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Employees() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data));
  }, []);

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

      {/* List */}
      <div className="grid gap-4">
        {employees.map((emp) => (
          <Link
  key={emp.id}
  to={`/employees/${emp.id}`}
  className="flex items-center gap-4 p-4 bg-white border border-gray-200 
  rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 
  hover:bg-gray-50 transition-all duration-300 group"
>
  {/* Avatar */}
  <div className="w-12 h-12 flex items-center justify-center rounded-full 
  bg-blue-100 text-blue-600 font-semibold text-lg group-hover:scale-110 transition">
    {emp.name.charAt(0)}
  </div>

  {/* Info */}
  <div className="flex-1">
    <h2 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition">
      {emp.name}
    </h2>

    <p className="text-sm text-gray-500">{emp.email}</p>

    <span className="inline-block mt-1 text-xs px-2 py-1 
    bg-gray-100 text-gray-600 rounded-full">
      {emp.employeeid}
    </span>
  </div>

  {/* Arrow */}
  <div className="text-gray-400 group-hover:text-blue-500 transition">
    →
  </div>
</Link>
        ))}
      </div>
    </div>
  );
}

export default Employees;