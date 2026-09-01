import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  RotateCcw,
  Plus,
  Save,
  Loader2,
  X,
  Building,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Calendar,
  ShieldCheck,
  Tag,
  UserCheck,
} from "lucide-react";
import { API_BASE_URL } from "../env";

const EditAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Initial Form State
  const initialFormState = {
    equipment: "",
    assetCode: "",
    brand: "",
    model: "",
    serialNumber: "",
    specifications: "",
    macAddress: "",
    company: "",
    location: "",
    department: "",
    floor: "",
    room: "",
    status: "",
    employeeId: "",
    receivedDate: "",
    oldUsers: [],
    purchaseDate: "",
    purchasePrice: "",
    warrantyStart: "",
    warrantyEnd: "",
    warrantyYears: "",
    vendorId: "",
    remarks: "",
    surveyStatus: "",
    upgradeEquipments: "",
    surveyer: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [initialData, setInitialData] = useState(null);

  // Dynamic lists fetched from API/list
  const [list, setlist] = useState({
    company: [],
    location: [],
    department: [],
    assetStatuses: [],
    surveyStatuses: [],
    equipment: [],
    brand: [],
  });
 

  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);

  // Loaders & UI Feedback
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Modals for inline list additions
  const [activeListModal, setActiveListModal] = useState(null); // 'equipment' | 'brand' | etc.
  const [newListItem, setNewListItem] = useState("");
  
  // Modal for inline Vendor addition
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [newVendor, setNewVendor] = useState({
    vendorName: "",
    contactPerson: "",
    contact: "",
    address: "",
  });

  // Search filter for vendors
  const [vendorSearch, setVendorSearch] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  // Handle auto-calculation of Warranty Start and Warranty End
  useEffect(() => {
    if (formData.purchaseDate) {
      const pDate = formData.purchaseDate;
      let calculatedEnd = formData.warrantyEnd;

      if (formData.warrantyYears) {
        const dateObj = new Date(pDate);
        if (!isNaN(dateObj.getTime())) {
          dateObj.setFullYear(dateObj.getFullYear() + parseInt(formData.warrantyYears, 10));
          calculatedEnd = dateObj.toISOString().split("T")[0];
        }
      }

      setFormData((prev) => ({
        ...prev,
        warrantyStart: pDate,
        warrantyEnd: calculatedEnd,
      }));
    }
  }, [formData.purchaseDate, formData.warrantyYears]);

  const fetchInitialData = async () => {
  try {
    setLoading(true);
    setErrorMessage("");

    // Fetch base list options, users, vendors, and target assets concurrently
    const [assetsRes, listRes, usersRes, vendorsRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/assets`),
      axios.get(`${API_BASE_URL}/list`),
      axios.get(`${API_BASE_URL}/users`),
      axios.get(`${API_BASE_URL}/vendors`),
    ]);

    // 1. Find target asset by id from the assets array
    const assetsList = assetsRes.data || [];
    const targetAsset = assetsList.find((item) => String(item.id) === String(id) || String(item._id) === String(id)) || null;
   
    // 2. Handle List Options
    // Check if list data is nested under `.list` or returned directly
    const rawList = listRes.data?.list || listRes.data || {};
    setlist({
      company: rawList.company || rawList.Company || [],
      location: rawList.location || rawList.Location || [],
      department: rawList.department || rawList.Department || [],
      assetStatuses: rawList.assetStatuses || [],
      surveyStatuses: rawList.surveyStatuses || [],
      equipment: rawList.equipment || [],
      brand: rawList.brand || [],
    });

    // 3. Handle Vendors & Users/Employees
    const vendorList = vendorsRes.data?.vendors || vendorsRes.data || [];
    const userList = usersRes.data?.users || usersRes.data?.employees || usersRes.data || [];

    setVendors(vendorList);
    setUsers(userList);

    // 4. Set Form & Pre-fill Vendor Search
    if (targetAsset) {
      setFormData(targetAsset);
      setInitialData(targetAsset);

      // Pre-fill vendor search text if vendor exists
      const currentVendor = vendorList.find(
        (v) => String(v.vendorId) === String(targetAsset.vendorId)
      );
      if (currentVendor) {
        setVendorSearch(currentVendor.vendorName);
      }
    }
  } catch (err) {
    console.error("Error loading asset edit data:", err);
    setErrorMessage("Failed to load asset data. Please verify the API connection.");
  } finally {
    setLoading(false);
  }
};

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form to initially fetched state
  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      const matchedVendor = vendors.find(
        (v) => String(v.vendorId) === String(initialData.vendorId)
      );
      setVendorSearch(matchedVendor ? matchedVendor.vendorName : "");
    }
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Required Field Validation
    if (
      !formData.equipment ||
      !formData.assetCode ||
      !formData.brand ||
      !formData.company ||
      !formData.location ||
      !formData.status ||
      !formData.purchaseDate
    ) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmUpdate = async () => {
    try {
      setSubmitting(true);
      await axios.put(`${API_BASE_URL}/assets/${id}`, formData);
      setShowConfirmModal(false);
      navigate(`/asset/${id}`);
    } catch (err) {
      console.error("Error updating asset:", err);
      alert("Failed to update asset. Please check server logs.");
    } finally {
      setSubmitting(false);
    }
  };

  // Add new item to dynamic list
  const handleAddListItem = (category) => {
    if (!newListItem.trim()) return;
    const updatedCategoryList = [...(list[category] || []), newListItem.trim()];

    setlist((prev) => ({
      ...prev,
      [category]: updatedCategoryList,
    }));

    // Select the newly added item in form
    setFormData((prev) => ({
      ...prev,
      [category === "assetStatuses"
        ? "status"
        : category === "surveyStatuses"
        ? "surveyStatus"
        : category]: newListItem.trim(),
    }));

    setNewListItem("");
    setActiveListModal(null);
  };

  // Save new Vendor
  const handleSaveVendor = async (e) => {
    e.preventDefault();
    if (!newVendor.vendorName.trim()) return;

    const generatedId = `VND${String(vendors.length + 1).padStart(3, "0")}`;
    const vendorObject = { ...newVendor, vendorId: generatedId };

    try {
      await axios.post(`${API_BASE_URL}/vendors`, vendorObject);
      setVendors((prev) => [...prev, vendorObject]);
      setFormData((prev) => ({ ...prev, vendorId: generatedId }));
      setVendorSearch(vendorObject.vendorName);
      setShowVendorModal(false);
      setNewVendor({ vendorName: "", contactPerson: "", contact: "", address: "" });
    } catch (err) {
      console.error("Error creating vendor:", err);
      // Fallback local update
      setVendors((prev) => [...prev, vendorObject]);
      setFormData((prev) => ({ ...prev, vendorId: generatedId }));
      setVendorSearch(vendorObject.vendorName);
      setShowVendorModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-slate-600 font-bold">Loading asset details for editing...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-white text-slate-900 p-6 flex flex-col items-center justify-center">
        <div className="bg-white border border-red-600 rounded-xl p-8 max-w-md w-full text-center shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600 mb-6 font-medium">{errorMessage}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold shadow-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>
    );
  }

  const filteredVendors = vendors.filter(
    (v) =>
      v.vendorName.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      (v.contactPerson && v.contactPerson.toLowerCase().includes(vendorSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-900 shadow-xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-900 px-4 py-2 rounded-lg font-bold transition text-sm shadow-xl w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-indigo-600" /> Edit Asset:{" "}
            <span className="text-indigo-600 font-mono">{formData.assetCode}</span>
          </h1>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-600 px-4 py-2 rounded-lg text-sm font-bold shadow-xl transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset Form
            </button>
          </div>
        </div>

        {/* Main Form Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic & Technical Details */}
          <div className="bg-white rounded-xl border border-blue-600 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-blue-700 pb-2 border-b-2 border-blue-100">
              <Tag className="w-5 h-5" />
              <h2 className="font-black text-slate-900">1. Basic & Technical Info</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Equipment Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Equipment <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    name="equipment"
                    value={formData.equipment}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  >
                    <option value="">Select Equipment</option>
                    {list.equipment.map((item, i) => (
                      <option key={i} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setActiveListModal("equipment")}
                    className="bg-indigo-600 text-white border border-slate-900 p-2 rounded-lg font-bold shadow-xl hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Asset Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Asset Code <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="assetCode"
                  value={formData.assetCode}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-mono font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              {/* Brand Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Brand <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  >
                    <option value="">Select Brand</option>
                    {list.brand.map((item, i) => (
                      <option key={i} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setActiveListModal("brand")}
                    className="bg-indigo-600 text-white border border-slate-900 p-2 rounded-lg font-bold shadow-xl hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Model */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Serial Number</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* MAC Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">MAC Address</label>
                <input
                  type="text"
                  name="macAddress"
                  value={formData.macAddress}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Specifications */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Specifications</label>
              <textarea
                name="specifications"
                value={formData.specifications}
                onChange={handleChange}
                rows={2}
                className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Section 2: Location & Deployment */}
          <div className="bg-white rounded-xl border border-emerald-600 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 pb-2 border-b-2 border-emerald-100">
              <Building className="w-5 h-5" />
              <h2 className="font-black text-slate-900">2. Organization & Location</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Company Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Company <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  >
                    <option value="">Select Company</option>
                    {list.company.map((item, i) => (
                      <option key={i} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setActiveListModal("company")}
                    className="bg-emerald-600 text-white border border-slate-900 p-2 rounded-lg font-bold shadow-xl hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Location Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Location <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  >
                    <option value="">Select Location</option>
                    {list.location.map((item, i) => (
                      <option key={i} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setActiveListModal("location")}
                    className="bg-emerald-600 text-white border border-slate-900 p-2 rounded-lg font-bold shadow-xl hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Department Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                <div className="flex items-center gap-2">
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="">Select Department</option>
                    {list.department.map((item, i) => (
                      <option key={i} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setActiveListModal("department")}
                    className="bg-emerald-600 text-white border border-slate-900 p-2 rounded-lg font-bold shadow-xl hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Floor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Floor</label>
                <input
                  type="text"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Room */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Room</label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Asset Status Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Status <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  >
                    <option value="">Select Status</option>
                    {list.assetStatuses.map((item, i) => (
                      <option key={i} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setActiveListModal("assetStatuses")}
                    className="bg-emerald-600 text-white border border-slate-900 p-2 rounded-lg font-bold shadow-xl hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Procurement & Vendor */}
          <div className="bg-white rounded-xl border border-indigo-600 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 pb-2 border-b-2 border-indigo-100">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="font-black text-slate-900">3. Purchase & Warranty Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Purchase Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Purchase Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Purchase Price ($)</label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Warranty Years */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Warranty Years</label>
                <select
                  name="warrantyYears"
                  value={formData.warrantyYears}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">Select Years</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Year{i > 0 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Warranty Start (Auto) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Warranty Start (Auto)
                </label>
                <input
                  type="date"
                  name="warrantyStart"
                  value={formData.warrantyStart}
                  readOnly
                  className="w-full bg-slate-200 border border-slate-400 rounded-lg p-2 text-sm font-bold text-slate-600 cursor-not-allowed"
                />
              </div>

              {/* Warranty End (Auto) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Warranty End (Auto)
                </label>
                <input
                  type="date"
                  name="warrantyEnd"
                  value={formData.warrantyEnd}
                  readOnly
                  className="w-full bg-slate-200 border border-slate-400 rounded-lg p-2 text-sm font-bold text-slate-600 cursor-not-allowed"
                />
              </div>

              {/* Vendor Searchable Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vendor</label>
                <div className="flex items-center gap-2">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Search vendor..."
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                    {vendorSearch && filteredVendors.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-900 rounded-lg max-h-40 overflow-y-auto z-20 shadow-lg">
                        {filteredVendors.map((v) => (
                          <div
                            key={v.vendorId}
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, vendorId: v.vendorId }));
                              setVendorSearch(v.vendorName);
                            }}
                            className="p-2 hover:bg-indigo-50 cursor-pointer text-xs font-bold border-b border-slate-100 last:border-none"
                          >
                            <p className="text-slate-900">{v.vendorName}</p>
                            {v.contactPerson && (
                              <p className="text-slate-500 text-[10px]">Contact: {v.contactPerson}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVendorModal(true)}
                    className="bg-indigo-600 text-white border border-slate-900 p-2 rounded-lg font-bold shadow-xl hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Audit & Survey Status */}
          <div className="bg-white rounded-xl border border-slate-900 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-slate-900 pb-2 border-b-2 border-slate-200">
              <UserCheck className="w-5 h-5" />
              <h2 className="font-black text-slate-900">4. Audit & Survey Status</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Survey Status Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Survey Status</label>
                <div className="flex items-center gap-2">
                  <select
                    name="surveyStatus"
                    value={formData.surveyStatus}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">Select Survey Status</option>
                    {list.surveyStatuses.map((item, i) => (
                      <option key={i} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setActiveListModal("surveyStatuses")}
                    className="bg-slate-900 text-white border border-slate-900 p-2 rounded-lg font-bold shadow-xl hover:bg-slate-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Surveyor Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Surveyor / Auditor</label>
                <select
                  name="surveyer"
                  value={formData.surveyer}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.username}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upgrade Equipments */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Upgrade Information
                </label>
                <input
                  type="text"
                  name="upgradeEquipments"
                  value={formData.upgradeEquipments}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={2}
                className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Form Controls */}
          <div className="flex items-center justify-end gap-4 bg-white p-4 rounded-xl border border-slate-900 shadow-xl">
            <button
              type="button"
              onClick={handleReset}
              className="bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-900 px-5 py-2.5 rounded-lg text-sm font-bold shadow-xl transition"
            >
              Reset
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white border border-slate-900 px-6 py-2.5 rounded-lg text-sm font-bold shadow-xl transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-indigo-600">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-lg font-black text-slate-900">Confirm Asset Update</h3>
            </div>
            <p className="text-sm text-slate-700 font-medium">
              Are you sure you want to update details for asset{" "}
              <span className="font-mono font-bold text-indigo-600">{formData.assetCode}</span>?
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition shadow-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUpdate}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border border-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-xl"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add List Item Modal */}
      {activeListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-900 rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-black text-slate-900 capitalize">
                Add New {activeListModal}
              </h3>
              <button onClick={() => setActiveListModal(null)} className="text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              placeholder={`Enter new ${activeListModal}`}
              value={newListItem}
              onChange={(e) => setNewListItem(e.target.value)}
              className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveListModal(null)}
                className="bg-slate-100 text-slate-900 border border-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAddListItem(activeListModal)}
                className="bg-indigo-600 text-white border border-slate-900 px-4 py-1.5 rounded-lg text-xs font-bold shadow-xl hover:bg-indigo-700"
              >
                Add Option
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Vendor Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-indigo-600 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
              <h3 className="text-md font-black text-slate-900">Add New Vendor</h3>
              <button onClick={() => setShowVendorModal(false)} className="text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Vendor Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newVendor.vendorName}
                  onChange={(e) => setNewVendor({ ...newVendor, vendorName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Person</label>
                <input
                  type="text"
                  value={newVendor.contactPerson}
                  onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone/Email</label>
                <input
                  type="text"
                  value={newVendor.contact}
                  onChange={(e) => setNewVendor({ ...newVendor, contact: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address</label>
                <input
                  type="text"
                  value={newVendor.address}
                  onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-900 rounded-lg p-2 text-sm font-bold focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="bg-slate-100 text-slate-900 border border-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white border border-slate-900 px-4 py-1.5 rounded-lg text-xs font-bold shadow-xl hover:bg-indigo-700"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAsset;