import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddEmployee() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    employeeid: "",
    email: "",
    location: "",
    contact: "",
    assetlist: [],
    assethistory: [],
  });

  const [error, setError] = useState("");

  // Handle Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.name || !formData.email || !formData.employeeid) {
      return setError("Please fill required fields");
    }

    await fetch("http://localhost:3000/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    navigate("/employees");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">Add Employee</h1>

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name *"
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
          />

          <input
            name="employeeid"
            placeholder="Employee ID *"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="email"
            placeholder="Email *"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="location"
            placeholder="Location"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="contact"
            placeholder="Contact Number"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate("/employees")}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            >
              Save Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEmployee;