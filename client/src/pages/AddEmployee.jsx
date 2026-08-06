import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "../env";

function AddEmployee() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    employeeid: "",
    email: "",
    designation: "",
    floor: "",
    location: "",
    contact: "",
    assetlist: [],
    assethistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [error, setError] = useState("");

  // Handle Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.employeeid ||
      !formData.designation
    ) {
      return setError("Please fill all required fields (*)");
    }

    const newEmployee = {
      ...formData,
      id: Date.now().toString(), // simple unique id
      assetlist: [],
      assethistory: [],
      createdAt: formData.createdAt,
      updatedAt: formData.updatedAt,
    };

    await fetch(`${API_BASE_URL}/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEmployee),
    });

    navigate("/employees");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => window.history.back()}
        className="my-5 border border-blue-600 py-2 px-4 rounded-lg flex  items-center gap-2 text-blue-600 hover:bg-blue-600 hover:text-white transition"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6">Add Employee</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          {/* Name */}
          <input
            name="name"
            placeholder="Full Name *"
            onChange={handleChange}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
          />

          {/* Employee ID */}
          <input
            name="employeeid"
            placeholder="Employee Code (EMP-101) *"
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* Email */}
          <input
            name="email"
            placeholder="Email *"
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* Contact */}
          <input
            name="contact"
            placeholder="Contact Number"
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* Designation */}
          <input
            name="designation"
            placeholder="Designation *"
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* Floor */}
          <input
            name="floor"
            placeholder="Floor (e.g., 5th Floor)"
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* Location (Full width) */}
          <input
            name="location"
            placeholder="Location"
            onChange={handleChange}
            className="border p-2 rounded md:col-span-2"
          />

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-between mt-4">
            <button
              type="button"
              onClick={() => navigate("/employees")}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
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
