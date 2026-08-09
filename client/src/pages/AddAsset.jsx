import React, { useState } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "../env";

const AddAsset = () => {
  const [formData, setFormData] = useState({
    id: "",
    assetCode: "",
    name: "",
    brand: "",
    category: "",
    status: "Instore",
    quantity: 1,
    assignEmpId: "",
    assignEmpCode: "",
    assignedDate: "",
    location: "",
    purchaseDate: "",
    warrantyStart: "",
    warrantyEnd: "",
    value: "",
    description: "",
    assetsComments:"",
    issues: "",
    history: "",
    prevEmployees: "",
    createdAt: "",
    updatedAt: "",
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const quantity = Math.max(1, Number(formData.quantity || 1));
    const baseAsset = {
      name: formData.name,
      assetCode: "AS-", // Base code, will be modified for each asset
      brand: formData.brand,
      category: formData.category,
      status: formData.status || "Instore",

      assignDetails: {
        assignEmpId: null,
        assignEmpCode: null,
        assignedDate: null,
        assignedTo: null,
      },

      location: formData.location,
      purchaseDate: formData.purchaseDate,

      warranty: {
        start: formData.warrantyStart,
        end: formData.warrantyEnd,
      },

      value: `${Number(formData.value)} Tk`,
      description: formData.description,

      assetsComments: formData.assetsComments ? formData.assetsComments : "None",
      issues: [],
      history: [],
      prevEmployees: [],

      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: formData.updatedAt || new Date().toISOString(),
    };

    try {
      const assetRequests = Array.from({ length: quantity }, (_, index) => {
        const newAsset = {
          ...baseAsset,
          id: `${Date.now()}-${index}`,
          assetCode: `AS-`,
        };

        return axios.post(`${API_BASE_URL}/assets`, newAsset);
      });

      await Promise.all(assetRequests);
      setSuccess(true);
      setMessage(
        quantity > 1
          ? `Successfully added ${quantity} assets.`
          : "Asset added successfully!",
      );
    } catch (err) {
      setSuccess(false);
      setMessage("Error adding asset");
    }
  };
  const resetHandler = () => {
    setFormData({
      id: "",
      assetCode: "",
      name: "",
      brand: "",
      category: "",
      status: "Instore",
      quantity: 1,
      assignEmpId: "",
      assignEmpCode: "",
      assignedDate: "",
      location: "",
      purchaseDate: "",
      warrantyStart: "",
      warrantyEnd: "",
      value: "",
      description: "",
      assetsComments: "",
      issues: "",
      history: "",
      prevEmployees: "",
      createdAt: "",
      updatedAt: "",
    });
  };

  const inputStyle =
    "w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-6">
      <button
        onClick={() => window.history.back()}
        className=" ml-10 my-5 border border-blue-600 py-2 px-4 rounded-lg flex  items-center gap-2 text-blue-600 hover:bg-blue-600 hover:text-white transition"
      >
        <ArrowLeft size={24} /> Back
      </button>
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 text-center text-xl font-bold">
          Add New Asset
        </div>

        {/* Message */}
        {message && (
          <div
            className={`m-4 p-3 rounded-lg text-white ${
              success ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* BASIC INFO */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Basic Info
            </h3>

            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="label">Asset Code</label>
                <input
                  className={inputStyle}
                  name="assetCode"
                  placeholder="AS-011"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Asset Name *</label>
                <input
                  className={inputStyle}
                  name="name"
                  placeholder="Dell XPS 13"
                  required
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Brand *</label>
                <input
                  className={inputStyle}
                  name="brand"
                  placeholder="Dell, Apple"
                  required
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Category *</label>
                <input
                  className={inputStyle}
                  name="category"
                  placeholder="Laptop, Mobile"
                  required
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Status *</label>
                <select
                  className={inputStyle}
                  name="status"
                  required
                  onChange={handleChange}
                >
                  <option value="Instore">In Store</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="label">Location *</label>
                <input
                  className={inputStyle}
                  name="location"
                  placeholder="e.g. Head Office"
                  required
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  className={inputStyle}
                  name="quantity"
                  value={formData.quantity}
                  required
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          {/* DATES */}
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-4">
              Dates & Warranty
            </h3>

            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="label">Purchase Date *</label>
                <input
                  type="date"
                  className={inputStyle}
                  name="purchaseDate"
                  required
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Warranty Start</label>
                <input
                  type="date"
                  className={inputStyle}
                  name="warrantyStart"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Warranty End</label>
                <input
                  type="date"
                  className={inputStyle}
                  name="warrantyEnd"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* VALUE */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-600 mb-4">
              Financial
            </h3>

            <div>
              <label className="label">Asset Value (BDT) *</label>
              <input
                type="number"
                className={inputStyle}
                name="value"
                placeholder="1200"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <h3 className="text-lg font-semibold text-pink-600 mb-4">
              Description
            </h3>

            <div>
              <label className="label">Description</label>
              <textarea
                className={inputStyle}
                name="description"
                placeholder="High-performance business laptop"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* EXTRA */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Extra Data
            </h3>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="label">Comments</label>
                <input
                  className={inputStyle}
                  name="assetsComments"
                  placeholder="Good condition, Needs upgrade"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Issues</label>
                <input
                  className={inputStyle}
                  name="issues"
                  placeholder="Battery issue, Screen flicker"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">History</label>
                <input
                  className={inputStyle}
                  name="history"
                  placeholder="Repaired in 2025, Reassigned"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Previous Employees</label>
                <input
                  className={inputStyle}
                  name="prevEmployees"
                  placeholder="EMP-100, EMP-102"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="text-center pt-4 gap-4 flex justify-center items-center space-x-4">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-2 rounded-lg shadow-md hover:scale-105 transition">
              Add Asset
            </button>
            <button
              type="reset"
              onClick={resetHandler}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-2 rounded-lg shadow-md hover:scale-105 transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAsset;
