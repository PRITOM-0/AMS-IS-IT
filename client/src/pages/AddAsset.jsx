import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../env";
import { ArrowLeft } from "lucide-react";

const DemoAssets = {
  quantity: 1,
  equipment: "",
  assetCode: "",
  brand: "",
  model: "",
  serialNumber: "",
  specifications: "",
  macAddress: "",
  department: "",
  location: "",
  floor: "",
  room: "",
  status: "Instore",
  userId: "",
  userCode: "",
  userName: "",
  oldUsers: [],
  receivedDate: "",
  purchaseDate: "",
  purchasePrice: "",
  warrantyStart: "",
  warrantyEnd: "",
  vendorName: "",
  remarks: "",
  surveyReport: "",
  createdAt: "",
  updatedAt: "",
};
const AddAsset = () => {
  const [formData, setFormData] = useState(DemoAssets);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const [success, setSuccess] = useState(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const quantity = Math.max(1, Number(formData.quantity || 1));
    const baseAsset = {
      equipment: formData.equipment,
      brand: formData.brand,
      model: formData.model,
      specifications: formData.specifications,
      location: formData.location,
      department: formData.department,
      floor: formData.floor,
      room: formData.room,
      status: formData.status || "Instore",

      receivedDate: null,
      purchaseDate: formData.purchaseDate,
      purchasePrice: `${Number(formData.purchasePrice)}`,
      warrantyStart: formData.warrantyStart,
      warrantyEnd: formData.warrantyEnd,
      vendorName: formData.vendorName,
      remarks: formData.remarks,
      surveyReport: formData.surveyReport,
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: formData.updatedAt || new Date().toISOString(),
    };
    try {
      const assetCodes = formData.assetCode
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
      const serialNumbers = formData.serialNumber
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
      const macAddresses = formData.macAddress
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
      if (
        assetCodes.length !== quantity ||
        serialNumbers.length !== quantity ||
        macAddresses.length !== quantity
      ) {
        alart("Set same quantity");
      }
      const assetRequests = Array.from({ length: quantity }, (_, index) => {
        const newAsset = {
          id: `${Date.now()}-${index}`,
          assetCode: assetCodes[index],
          serialNumber: serialNumbers[index],
          macAddress: macAddresses[index],
          ...baseAsset,
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
    setFormData(DemoAssets);
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

            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="label">Equipment *</label>
                <input
                  className={inputStyle}
                  name="equipment"
                  placeholder="eg. PC , Laptop"
                  required
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Asset Code *</label>
                <input
                  className={inputStyle}
                  name="assetCode"
                  placeholder="eg. 06-01-01-0745"
                  required
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Brand *</label>
                <input
                  className={inputStyle}
                  name="brand"
                  placeholder="eg. Walton, Dell"
                  required
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Model</label>
                <input
                  className={inputStyle}
                  name="model"
                  placeholder="eg. V8, Elite"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Serial Number *</label>
                <input
                  className={inputStyle}
                  name="serialNumber"
                  placeholder="eg. RDTDFU76689"
                  required
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Specifications *</label>
                <input
                  className={inputStyle}
                  name="specifications"
                  placeholder="eg. 16GB RAM, 512 GB SSD"
                  required
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">MAC Address *</label>
                <input
                  className={inputStyle}
                  name="macAddress"
                  placeholder="eg. fg:08:hj:90:98"
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
                  <option value="Instore">Instore</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Death">Death</option>
                </select>
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
          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Location / Campus
            </h3>

            <div className="grid md:grid-cols-4 gap-3">
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
                <label className="label">Department</label>
                <input
                  className={inputStyle}
                  name="department"
                  placeholder="e.g. HR, IT"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">floor</label>
                <input
                  className={inputStyle}
                  name="floor"
                  placeholder="e.g. 2nd, 3rd"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Room</label>
                <input
                  className={inputStyle}
                  name="room"
                  placeholder="e.g. 501, 603"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* VALUE */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Financial & Warranty
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="label">Purchase Price (BDT) *</label>
                <input
                  type="number"
                  className={inputStyle}
                  name="purchasePrice"
                  placeholder="12000"
                  required
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Vendor Name</label>
                <input
                  className={inputStyle}
                  name="vendorName"
                  placeholder="e.g. Star Tech"
                  onChange={handleChange}
                />
              </div>
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

          {/* DESCRIPTION */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Description
            </h3>

            <div>
              <label className="label">Remarks</label>
              <textarea
                className={inputStyle}
                name="remarks"
                placeholder="High-performance business laptop"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Survey Report</label>
              <textarea
                className={inputStyle}
                name="surveyReport"
                placeholder="Updated"
                onChange={handleChange}
              />
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
