import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../env";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import { FaPlus } from "react-icons/fa";
const getTodayDate = () => new Date().toISOString().split("T")[0];

const initialFormState = {
  equipment: "",
  assetCode: "",
  brand: "",
  model: "",
  serialNumber: "",
  specifications: "",
  macAddress: "",
  company: "",
  department: "",
  location: "",
  floor: "",
  room: "",
  status: "",
  employeeId: "",
  oldUsers: [],
  receivedDate: "",
  purchaseDate: getTodayDate(),
  purchasePrice: "",
  warrantyStart: "",
  warrantyEnd: "",
  warrantyYears: "",
  vendorId: "",
  remarks: "",
  surveyId: "",
};

const AddAsset = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic dropdown options extracted from existing DB assets
  const [dropdownOptions, setDropdownOptions] = useState({
    equipments: [],
    brands: [],
    companys: [],
    departments: [],
    locations: [],
    statuses: [],
    vendors: [],
    surveyReports: [],
  });

  // Fetch existing asset data from backend on mount
  useEffect(() => {
    const fetchExistingAssets = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/assets`);
        const assets = Array.isArray(response.data) ? response.data : [];

        // Helper function to extract, sanitize, and unique-filter values
        const getUnique = async (key) => {
          // ==========================================
          // Vendors
          // ==========================================
          if (key === "vendors") {
            try {
              const response = await axios.get(`${API_BASE_URL}/vendors`);

              const vendors = response.data || [];

              return Array.from(
                new Set(
                  vendors
                    .map((vendor) =>
                      vendor.vendorName ? String(vendor.vendorName).trim() : "",
                    )
                    .filter((value) => value !== ""),
                ),
              );
            } catch (error) {
              console.error("Failed to fetch vendors:", error);
              return [];
            }
          }

          // ==========================================
          // Normal asset fields
          // ==========================================
          return Array.from(
            new Set(
              assets
                .map((item) => (item[key] ? String(item[key]).trim() : ""))
                .filter((value) => value !== ""),
            ),
          );
        };

        setDropdownOptions({
          equipments: getUnique("equipment"),
          brands: getUnique("brand"),
          companys: getUnique("company"),
          departments: getUnique("department"),
          locations: getUnique("location"),
          statuses: getUnique("status"),
          vendors: getUnique("vendorName"),
        });
      } catch (err) {
        console.error("Failed to load existing assets for dropdowns:", err);
      }
    };

    fetchExistingAssets();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Sync warrantyStart with purchaseDate automatically if purchaseDate changes
      if (name === "purchaseDate") {
        updated.warrantyStart = value;
      }

      // Calculate warrantyEnd if quick preset option selected
      if (name === "warrantyYears" && value && prev.purchaseDate) {
        const pDate = new Date(prev.purchaseDate);
        pDate.setFullYear(pDate.getFullYear() + parseInt(value, 10));
        updated.warrantyEnd = pDate.toISOString().split("T")[0];
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const now = new Date().toISOString();

    const payload = {
      equipment: formData.equipment,
      assetCode: formData.assetCode,
      brand: formData.brand,
      model: formData.model,
      serialNumber: formData.serialNumber,
      specifications: formData.specifications,
      macAddress: formData.macAddress,
      company: formData.company,
      department: formData.department,
      location: formData.location,
      floor: formData.floor,
      room: formData.room,
      status: formData.status,
      userId: formData.userId || "",
      userCode: formData.userCode || "",
      userName: formData.userName || "",
      oldUsers: formData.oldUsers || "", // Kept as pure string
      receivedDate: formData.receivedDate || null,
      purchaseDate: formData.purchaseDate,
      purchasePrice: formData.purchasePrice
        ? String(Number(formData.purchasePrice))
        : "0",
      warrantyStart: formData.warrantyStart || formData.purchaseDate,
      warrantyEnd: formData.warrantyEnd || "",
      vendorName: formData.vendorName,
      remarks: formData.remarks,
      surveyReport: formData.surveyReport,
      upgradeEquipments: formData.upgradeEquipments,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await axios.post(`${API_BASE_URL}/assets`, payload);
      setIsSuccess(true);
      setMessage("Asset added successfully!");
      setFormData({
        ...initialFormState,
        purchaseDate: getTodayDate(),
        warrantyStart: getTodayDate(),
      });
    } catch (err) {
      setIsSuccess(false);
      setMessage("Error adding asset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      ...initialFormState,
      purchaseDate: getTodayDate(),
      warrantyStart: getTodayDate(),
    });
    setMessage("");
  };

  const inputStyle =
    "w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-700 bg-white";

  return (
    <div className="min-h-screen  p-4 md:p-8 ">
      <div className="max-w-5xl mx-auto ">
        <button
          onClick={() => window.history.back()}
          className="mb-6 bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 hover:text-white transition shadow-sm font-medium"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden  border border-blue-600">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 px-6 text-center text-3xl font-bold tracking-wide">
            Add New Asset
          </div>

          {message && (
            <div
              className={`mx-6 mt-6 p-4 rounded-lg text-white text-center font-medium shadow-sm ${
                isSuccess ? "bg-emerald-500" : "bg-rose-500"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {/* DATALISTS for combo inputs */}
            <datalist id="equipment-db-options">
              {dropdownOptions.equipments.map((opt, i) => (
                <option key={i} value={opt} />
              ))}
            </datalist>

            <datalist id="brand-db-options">
              {dropdownOptions.brands.map((opt, i) => (
                <option key={i} value={opt} />
              ))}
            </datalist>

            <datalist id="department-db-options">
              {dropdownOptions.departments.map((opt, i) => (
                <option key={i} value={opt} />
              ))}
            </datalist>
            <datalist id="company-db-options">
              {dropdownOptions.companys.map((opt, i) => (
                <option key={i} value={opt} />
              ))}
            </datalist>
            <datalist id="location-db-options">
              {dropdownOptions.locations.map((opt, i) => (
                <option key={i} value={opt} />
              ))}
            </datalist>

            <datalist id="vendor-db-options">
              {dropdownOptions.vendors.map((opt, i) => (
                <option key={i} value={opt} />
              ))}
            </datalist>

            <datalist id="survey-db-options">
              {dropdownOptions.surveyReports.map((opt, i) => (
                <option key={i} value={opt} />
              ))}
            </datalist>

            {/* BASIC DETAILS */}
            <div>
              <h3 className="text-lg font-bold text-blue-600 border-b pb-2 mb-4">
                Basic Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Equipment <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={inputStyle}
                    name="equipment"
                    list="equipment-db-options"
                    placeholder="Type or select..."
                    value={formData.equipment}
                    required
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Asset Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={inputStyle}
                    name="assetCode"
                    placeholder="e.g. AST-06-01-0745"
                    value={formData.assetCode}
                    required
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={inputStyle}
                    name="brand"
                    list="brand-db-options"
                    placeholder="Type or select brand"
                    value={formData.brand}
                    required
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    className={inputStyle}
                    name="model"
                    placeholder="e.g. Latitude 3420"
                    value={formData.model}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Serial Number
                  </label>
                  <input
                    className={inputStyle}
                    name="serialNumber"
                    placeholder="e.g. RDTDFU76689"
                    value={formData.serialNumber}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    MAC Address
                  </label>
                  <input
                    className={inputStyle}
                    name="macAddress"
                    placeholder="e.g. 00:1B:44:11:3A:B7"
                    value={formData.macAddress}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={inputStyle}
                    name="status"
                    placeholder="Select status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="">All Status</option>
                    <option value="Instock">Instock</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="removal">Removal</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Specifications
                  </label>
                  <input
                    className={inputStyle}
                    name="specifications"
                    placeholder="e.g. Core i5 12th Gen, 16GB RAM, 512GB SSD"
                    value={formData.specifications}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* USER & ASSIGNMENT DETAILS */}
            <div>
              <h3 className="text-lg font-bold text-blue-600 border-b pb-2 mb-4">
                User & Assignment Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    className={inputStyle}
                    name="userCode"
                    placeholder="e.g. EMP-102"
                    value={formData.userCode}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    User Name
                  </label>
                  <input
                    className={inputStyle}
                    name="userName"
                    placeholder="e.g. John Doe"
                    value={formData.userName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Old Users
                  </label>
                  <input
                    className={inputStyle}
                    name="oldUsers"
                    placeholder="e.g. User A, User B"
                    value={formData.oldUsers}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Received Date
                  </label>
                  <input
                    type="date"
                    className={inputStyle}
                    name="receivedDate"
                    value={formData.receivedDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* LOCATION & PLACEMENT */}
            <div>
              <h3 className="text-lg font-bold text-blue-600 border-b pb-2 mb-4">
                Location & Placement
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={inputStyle}
                    name="company"
                    list="company-db-options"
                    placeholder="Type or select company"
                    value={formData.company}
                    required
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={inputStyle}
                    name="location"
                    list="location-db-options"
                    placeholder="Type or select location"
                    value={formData.location}
                    required
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    className={inputStyle}
                    name="department"
                    list="department-db-options"
                    placeholder="Type or select department"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Floor
                  </label>
                  <input
                    className={inputStyle}
                    name="floor"
                    placeholder="e.g. 2nd Floor"
                    value={formData.floor}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Room
                  </label>
                  <input
                    className={inputStyle}
                    name="room"
                    placeholder="e.g. 501"
                    value={formData.room}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* FINANCIAL & WARRANTY */}
            <div>
              <h3 className="text-lg font-bold text-blue-600 border-b pb-2 mb-4">
                Financial & Warranty
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 ">
                    Purchase Price (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={inputStyle}
                    name="purchasePrice"
                    placeholder="e.g. 45000"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Vendor Name
                  </label>
                  <div className="flex items-center justify-center">
                    <input
                      className={inputStyle}
                      name="vendorName"
                      list="vendor-db-options"
                      placeholder="Type or select vendor"
                      value={formData.vendorName}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="h-full p-2 mx-1 border border-green-300 rounded-full  flex items-center justify-center text-green-500 hover:text-green-600 hover:scale-110 active:scale-95 transition-all duration-150 ease-in-out cursor-pointer focus:outline-none"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={inputStyle}
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="hidden">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Warranty Start
                  </label>
                  <input
                    type="date"
                    className={inputStyle}
                    name="warrantyStart"
                    value={formData.warrantyStart}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Quick Warranty Preset
                  </label>
                  <select
                    className={inputStyle}
                    name="warrantyYears"
                    value={formData.warrantyYears}
                    onChange={handleChange}
                  >
                    <option value="">Select Period...</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? "Year" : "Years"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Warranty End Date
                  </label>
                  <input
                    type="date"
                    className={inputStyle}
                    name="warrantyEnd"
                    value={formData.warrantyEnd}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* REMARKS & UPGRADES */}
            <div>
              <h3 className="text-lg font-bold text-blue-600 border-b pb-2 mb-4">
                Remarks, Upgrades & Reports
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Survey Report
                  </label>
                  <select
                    className={inputStyle}
                    name="surveyReport"
                    placeholder="Select survey status"
                    required
                    value={formData.surveyReport}
                    onChange={handleChange}
                  >
                    <option>Select...</option>
                    <option value="OK">OK</option>
                    <option value="Update">Update</option>
                    <option value="Replace">Replace</option>
                    <option value="Repair/Service">Repair/Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Upgrade Equipments
                  </label>
                  <input
                    className={inputStyle}
                    name="upgradeEquipments"
                    placeholder="e.g. Added 8GB RAM, 1TB SSD"
                    value={formData.upgradeEquipments}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    rows={1}
                    className={inputStyle}
                    name="remarks"
                    placeholder="Any notes..."
                    value={formData.remarks}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {isSubmitting ? "Saving Asset..." : "Save Asset"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto bg-gray-100 text-gray-700 border border-gray-300 px-8 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-gray-200 hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAsset;
