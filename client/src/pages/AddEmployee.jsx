import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "../env";

function AddEmployee() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    employeeCode: "",
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
      !formData.employeeCode ||
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
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Full Name *</label>
            <input
              name="name"
              placeholder="eg: John Doe"
              onChange={handleChange}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
          /></div>

          {/* Employee Code */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Employee Code *</label>
            <input
              name="employeeCode"
              placeholder="eg: EMP-101"
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Email *</label>
            <input
              name="email"
              placeholder="eg: john.doe@example.com"
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>

          {/* Contact */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Contact Number</label>
            <input
              name="contact"
              placeholder="eg: +1 234 567 890"
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>

          {/* Designation */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Designation *</label>
            <input
              name="designation"
              placeholder="eg: Software Engineer"
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>

          {/* Floor */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Floor</label>
            <input
              name="floor"
              placeholder="eg: 5th Floor"
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>

          {/* Location (Full width) */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Location</label>
            <input
              name="location"
              placeholder="eg: Corporate Office"
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>

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
