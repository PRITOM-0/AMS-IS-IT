import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/employees/${id}`)
      .then((res) => res.json())
      .then((data) => setEmployee(data));
  }, [id]);

  if (!employee) {
    return <div className="p-6">Loading employee...</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{employee.name}</h1>
          <button
            onClick={() => navigate("/employees")}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
          >
            Back
          </button>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><strong>ID:</strong> {employee.employeeid}</p>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Location:</strong> {employee.location}</p>
          <p><strong>Contact:</strong> {employee.contact}</p>
        </div>

        {/* Assets */}
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Assigned Assets</h2>

          {employee.assetlist.length === 0 ? (
            <p className="text-gray-500 text-sm">No assets assigned</p>
          ) : (
            <ul className="list-disc ml-5 text-sm">
              {employee.assetlist.map((asset, i) => (
                <li key={i}>{asset}</li>
              ))}
            </ul>
          )}
        </div>

        {/* History */}
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Asset History</h2>

          {employee.assethistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No history</p>
          ) : (
            <ul className="list-disc ml-5 text-sm">
              {employee.assethistory.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetails;