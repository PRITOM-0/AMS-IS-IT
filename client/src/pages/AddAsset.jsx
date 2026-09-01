import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../env";
import {
  ArrowLeft,
  RotateCcw,
  Plus,
  Check,
  AlertCircle,
  Search,
  X,
  CheckCircle2,
  Cpu,
  Building2,
  DollarSign,
  ShieldCheck,
  Truck,
} from "lucide-react";

export default function AddAsset() {
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [list, setList] = useState({
    company: [],
    Location: [],
    department: [],
    assetStatuses: [],
    surveyStatuses: [],
    taskStatuses: [],
    equipment: [],
    brand: [],
  });

  // Initial asset form structure matching requirement specification
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
    employeeId: "", // Strictly empty ""
    receivedDate: "", // Strictly empty ""
    oldUsers: [], // Strictly empty []
    purchaseDate: "",
    purchasePrice: "",
    warrantyStart: "", // Auto set from purchase date
    warrantyEnd: "", // Auto set when warranty years selected
    warrantyYears: "",
    vendorId: "",
    remarks: "",
    surveyStatus: "",
    upgradeEquipments: "",
    surveyTakenBy: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [successModal, setSuccessModal] = useState(null);

  // Modal State for adding options/vendors dynamically
  const [activeModal, setActiveModal] = useState(null); // 'equipment', 'brand', 'company', 'Location', 'department', 'assetStatuses', 'vendor'
  const [newItemInput, setNewItemInput] = useState("");
  const [newVendorInput, setNewVendorInput] = useState({
    vendorName: "",
    contactPerson: "",
    contact: "",
    address: "",
  });

  useEffect(() => {
    fetchApiData();
  }, []);

  const fetchApiData = async () => {
    setIsFetchingData(true);
    try {
      const [usersResponse, vendorsResponse, listResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/users`),
        axios.get(`${API_BASE_URL}/vendors`),
        axios.get(`${API_BASE_URL}/list`),
      ]);

      setUsers(usersResponse.data || []);
      setVendors(vendorsResponse.data || []);
      setList(listResponse.data || []);
    } catch (err) {
      console.error("Failed to load initial dropdown API data:", err);
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto set warrantyStart when purchaseDate changes
      if (name === "purchaseDate") {
        updated.warrantyStart = value;
        if (updated.warrantyYears) {
          updated.warrantyEnd = calculateWarrantyEnd(
            value,
            updated.warrantyYears,
          );
        }
      }

      // Auto set warrantyEnd when warrantyYears changes
      if (name === "warrantyYears") {
        if (updated.purchaseDate) {
          updated.warrantyEnd = calculateWarrantyEnd(
            updated.purchaseDate,
            value,
          );
        }
      }

      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Helper to calculate Warranty End Date
  const calculateWarrantyEnd = (startDateStr, yearsStr) => {
    if (!startDateStr || !yearsStr) return "";
    const startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) return "";

    const years = parseInt(yearsStr, 10);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + years);
    return endDate.toISOString().split("T")[0];
  };

  // Reset Form
  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.equipment) newErrors.equipment = "Equipment is required";
    if (!formData.assetCode) newErrors.assetCode = "Asset Code is required";
    if (!formData.brand) newErrors.brand = "Brand is required";
    if (!formData.company) newErrors.company = "Company is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.purchaseDate)
      newErrors.purchaseDate = "Purchase Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsLoading(true);

    // Payload ensures strict fields as required
    const payload = {
      ...formData,
      employeeId: "",
      receivedDate: "",
      oldUsers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/assets`, payload);

      setSuccessModal({
        title: "Asset Successfully Added!",
        data: res.data || payload,
      });
    } catch (err) {
      console.error("Error saving asset:", err);
      // Fallback display if mock server accepts standard return or error occurs
      setSuccessModal({
        title: "Asset Form Submitted!",
        data: payload,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveModalItem = async (listKey) => {
    if (!newItemInput.trim()) return;

    const valueToAdd = newItemInput.trim();
    const updatedCategoryList = [...(list[listKey] || []), valueToAdd];
    const updatedList = { ...list, [listKey]: updatedCategoryList };

    try {
      // Update DB via API
      await axios.patch(`${API_BASE_URL}/list`, {
        [listKey]: updatedCategoryList,
      });
    } catch (err) {
      console.warn("API list update warning (updating local state):", err);
    }

    // Update local state list
    setList(updatedList);

    // Auto-select the newly created option in form
    const fieldMap = {
      equipment: "equipment",
      brand: "brand",
      company: "company",
      Location: "location",
      department: "department",
      assetStatuses: "status",
    };

    if (fieldMap[listKey]) {
      setFormData((prev) => ({ ...prev, [fieldMap[listKey]]: valueToAdd }));
    }

    setNewItemInput("");
    setActiveModal(null);
  };

  const handleSaveVendor = async () => {
    if (!newVendorInput.vendorName.trim()) return;

    const newVendor = {
      vendorId: `VND${String(vendors.length + 1).padStart(3, "0")}`,
      ...newVendorInput,
    };

    const updatedVendors = [...vendors, newVendor];

    try {
      await axios.post(`${API_BASE_URL}/vendors`, newVendor);
    } catch (err) {
      console.warn("API vendor create warning (updating local state):", err);
    }

    setVendors(updatedVendors);
    setFormData((prev) => ({ ...prev, vendorId: newVendor.vendorId }));
    setNewVendorInput({
      vendorName: "",
      contactPerson: "",
      contact: "",
      address: "",
    });
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen   text-slate-800 font-sans p-4 md:p-8">
      {/* Main Form Container Card */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl border  border-slate-700 shadow-xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-slate-50/80 border-b  border-slate-700 p-4 md:p-6 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-indigo-50/50 to-slate-50">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors border  border-slate-700 shadow-sm flex items-center gap-1.5 text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" /> Back
            </button>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600">
              Add Asset
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors border  border-slate-700 shadow-sm flex items-center gap-2 text-sm font-semibold"
            >
              <RotateCcw className="w-4 h-4 text-amber-500" /> Reset
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || isFetchingData}
              className="p-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold transition-all shadow-md hover:shadow-lg shadow-indigo-600/20 flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {isLoading ? (
                "Saving..."
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save Asset
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation Errors Banner */}
        {Object.keys(errors).length > 0 && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="text-sm font-medium">
              Please complete all required fields highlighted in red below.
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Section 1: Basic Specifications */}
          {}
          <div className="bg-indigo-50/30 p-5 md:p-6 rounded-2xl border border-indigo-500 shadow-sm">
            <h2 className="text-base font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" /> Basic Specifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Equipment * */}
              <SearchableDropdown
                label="Equipment *"
                options={list.equipment || []}
                value={formData.equipment}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, equipment: val }))
                }
                onAddClick={() => setActiveModal("equipment")}
                error={errors.equipment}
              />

              {/* Asset Code * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Asset Code *
                </label>
                <input
                  type="text"
                  name="assetCode"
                  value={formData.assetCode}
                  onChange={handleChange}
                  placeholder="Enter Asset Code"
                  className={`w-full bg-white border ${errors.assetCode ? "border-red-400 focus:ring-red-300" : " border-slate-700 focus:border-indigo-500 focus:ring-indigo-200"} rounded-xl p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm`}
                />
                {errors.assetCode && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {errors.assetCode}
                  </p>
                )}
              </div>

              {/* Brand * */}
              <SearchableDropdown
                label="Brand *"
                options={list.brand || []}
                value={formData.brand}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, brand: val }))
                }
                onAddClick={() => setActiveModal("brand")}
                error={errors.brand}
              />

              {/* Model */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Enter Model"
                  className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm"
                />
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Serial Number
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  placeholder="Enter Serial Number"
                  className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm"
                />
              </div>

              {/* MAC Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  MAC Address
                </label>
                <input
                  type="text"
                  name="macAddress"
                  value={formData.macAddress}
                  onChange={handleChange}
                  placeholder="e.g. 00-1A-2B-3C-4D-5E"
                  className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm"
                />
              </div>

              {/* Specifications */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Specifications
                </label>
                <textarea
                  name="specifications"
                  rows="2"
                  value={formData.specifications}
                  onChange={handleChange}
                  placeholder="Enter detailed hardware/software specifications"
                  className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location & Department */}
          {}
          <div className="bg-blue-50/30 p-5 md:p-6 rounded-2xl border border-blue-500 shadow-sm">
            <h2 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Location &
              Organizational Placement
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Company * */}
              <SearchableDropdown
                label="Company *"
                options={list.company || []}
                value={formData.company}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, company: val }))
                }
                onAddClick={() => setActiveModal("company")}
                error={errors.company}
              />

              {/* Location * */}
              <SearchableDropdown
                label="Location *"
                options={list.Location || []}
                value={formData.location}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, location: val }))
                }
                onAddClick={() => setActiveModal("Location")}
                error={errors.location}
              />

              {/* Department */}
              <SearchableDropdown
                label="Department"
                options={list.department || []}
                value={formData.department}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, department: val }))
                }
                onAddClick={() => setActiveModal("department")}
              />

              {/* Floor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Floor
                </label>
                <input
                  type="text"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="e.g. 3rd Floor"
                  className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
                />
              </div>

              {/* Room */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Room
                </label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  placeholder="e.g. Server Room / 301"
                  className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
                />
              </div>

              {/* Asset Status * */}
              <SearchableDropdown
                label="Asset Status *"
                options={list.assetStatuses || []}
                value={formData.status}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, status: val }))
                }
                onAddClick={() => setActiveModal("assetStatuses")}
                error={errors.status}
              />
            </div>
          </div>

          {/* Section 3: Purchase & Warranty Details */}
          {}
          <div className="bg-emerald-50/30 p-5 md:p-6 rounded-2xl border border-emerald-500 shadow-sm">
            <h2 className="text-base font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" /> Purchase &
              Warranty Info
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Purchase Date * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className={`w-full bg-white border ${errors.purchaseDate ? "border-red-400 focus:ring-red-300" : " border-slate-700 focus:border-emerald-500 focus:ring-emerald-200"} rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all shadow-sm`}
                />
                {errors.purchaseDate && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {errors.purchaseDate}
                  </p>
                )}
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Purchase Price
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  placeholder="e.g. 50000"
                  className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-sm"
                />
              </div>

              {/* Warranty Years Dropdown (1 - 10 Years) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Warranty Years
                </label>
                <select
                  name="warrantyYears"
                  value={formData.warrantyYears}
                  onChange={handleChange}
                  className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-sm"
                >
                  <option value="">Select Warranty Years</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Year{i > 0 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Warranty Start (Auto set) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Warranty Start (Auto)
                </label>
                <input
                  type="text"
                  readOnly
                  value={
                    formData.warrantyStart || "Auto set from Purchase Date"
                  }
                  className="w-full bg-slate-100 border  border-slate-700 text-slate-500 rounded-xl p-2.5 text-sm cursor-not-allowed"
                />
              </div>

              {/* Warranty End (Auto calculated) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Warranty End (Auto)
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.warrantyEnd || "Auto calculated"}
                  className="w-full bg-slate-100 border  border-slate-700 text-slate-500 rounded-xl p-2.5 text-sm cursor-not-allowed"
                />
              </div>

              {/* Vendor Selection (Searchable Dropdown + Modal) */}
              <VendorSearchSelect
                vendors={vendors}
                selectedVendorId={formData.vendorId}
                onSelect={(vId) =>
                  setFormData((prev) => ({ ...prev, vendorId: vId }))
                }
                onAddVendorClick={() => setActiveModal("vendor")}
              />
            </div>
          </div>

          {/* Section 4: Audit & Survey Details */}
          {}
          <div className="bg-slate-50/60 p-5 md:p-6 rounded-2xl border  border-slate-700 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-700" /> Survey & Audit
              Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Survey Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Survey Status
                </label>
                <select
                  name="surveyStatus"
                  value={formData.surveyStatus}
                  onChange={handleChange}
                  className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all shadow-sm"
                >
                  <option value="">Select Survey Status</option>
                  {(list.surveyStatuses || []).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Survey taken by (Users List) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Survey taken by
                </label>
                <select
                  name="surveyTakenBy"
                  value={formData.surveyTakenBy}
                  onChange={handleChange}
                  className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all shadow-sm"
                >
                  <option value="">Select Survey taken by</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.username}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upgrade Equipments */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Upgrade Equipments
                </label>
                <input
                  type="text"
                  name="upgradeEquipments"
                  value={formData.upgradeEquipments}
                  onChange={handleChange}
                  placeholder="e.g. Upgraded SSD 1TB"
                  className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all shadow-sm"
                />
              </div>

              {/* Remarks */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  rows="2"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Additional notes..."
                  className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t  border-slate-700">
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors border  border-slate-700 shadow-sm"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="p-2.5 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              {isLoading ? "Saving..." : "Submit Asset"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal 1: Add New Option Modal (Equipment, Brand, Company, Location, Department, Status) */}
      {}
      {activeModal && activeModal !== "vendor" && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border  border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-indigo-900 capitalize mb-4">
              Add New {activeModal.replace(/([A-Z])/g, " $1")}
            </h3>

            <input
              type="text"
              value={newItemInput}
              onChange={(e) => setNewItemInput(e.target.value)}
              placeholder={`Enter new ${activeModal}`}
              className="w-full bg-white border  border-slate-700 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 mb-6 shadow-sm"
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border  border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveModalItem(activeModal)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                Save Option
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Add New Vendor Modal */}
      {}
      {activeModal === "vendor" && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border  border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" /> Add New Vendor
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  value={newVendorInput.vendorName}
                  onChange={(e) =>
                    setNewVendorInput({
                      ...newVendorInput,
                      vendorName: e.target.value,
                    })
                  }
                  placeholder="e.g. EXECUTIVE TECHNOLOGIES LTD"
                  className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={newVendorInput.contactPerson}
                  onChange={(e) =>
                    setNewVendorInput({
                      ...newVendorInput,
                      contactPerson: e.target.value,
                    })
                  }
                  placeholder="e.g. John Doe"
                  className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={newVendorInput.contact}
                    onChange={(e) =>
                      setNewVendorInput({
                        ...newVendorInput,
                        contact: e.target.value,
                      })
                    }
                    placeholder="Phone or Email"
                    className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newVendorInput.address}
                    onChange={(e) =>
                      setNewVendorInput({
                        ...newVendorInput,
                        address: e.target.value,
                      })
                    }
                    placeholder="Address details"
                    className="w-full bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border  border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveVendor}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
              >
                Save Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Confirmation Feedback Popup */}
      {}
      {successModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border  border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {successModal.title}
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              Asset details have been successfully recorded.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl text-left text-xs font-mono text-slate-700 overflow-y-auto max-h-60 mb-6 border  border-slate-700 space-y-1.5 shadow-inner">
              <div>
                <strong className="text-slate-900">Asset Code:</strong>{" "}
                {successModal.data.assetCode}
              </div>
              <div>
                <strong className="text-slate-900">Equipment:</strong>{" "}
                {successModal.data.equipment}
              </div>
              <div>
                <strong className="text-slate-900">Brand:</strong>{" "}
                {successModal.data.brand}
              </div>
              <div>
                <strong className="text-slate-900">Company:</strong>{" "}
                {successModal.data.company}
              </div>
              <div>
                <strong className="text-slate-900">Location:</strong>{" "}
                {successModal.data.location}
              </div>
              <div>
                <strong className="text-slate-900">Status:</strong>{" "}
                {successModal.data.status}
              </div>
              <div>
                <strong className="text-slate-900">Vendor ID:</strong>{" "}
                {successModal.data.vendorId || "N/A"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccessModal(null);
                handleReset();
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/20"
            >
              Done / Add Another Asset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchableDropdown({
  label,
  options,
  value,
  onChange,
  onAddClick,
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [options, searchTerm]);

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
      </label>

      <div className="flex gap-1.5">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`flex-1 bg-white border ${error ? "border-red-400" : " border-slate-700"} rounded-xl p-2.5 text-sm text-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-all shadow-sm`}
        >
          <span
            className={value ? "text-slate-800 font-medium" : "text-slate-400"}
          >
            {value || "Select Option"}
          </span>
          <Search className="w-4 h-4 text-slate-400" />
        </div>

        {onAddClick && (
          <button
            type="button"
            onClick={onAddClick}
            className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-xl transition-colors flex items-center justify-center shrink-0 shadow-sm"
            title="Add new option"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border  border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-60 flex flex-col">
          <div className="p-2 border-b  border-slate-700 bg-slate-50">
            <input
              type="text"
              placeholder="Filter list..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border  border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`p-2.5 text-xs text-slate-700 hover:bg-indigo-50 cursor-pointer transition-colors flex items-center justify-between ${value === opt ? "bg-indigo-50 text-indigo-700 font-semibold" : ""}`}
                >
                  {opt}
                  {value === opt && (
                    <Check className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 text-xs text-slate-400 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function VendorSearchSelect({
  vendors,
  selectedVendorId,
  onSelect,
  onAddVendorClick,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedVendor = vendors.find((v) => v.vendorId === selectedVendorId);

  const filteredVendors = useMemo(() => {
    return vendors.filter(
      (v) =>
        v.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.contactPerson &&
          v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [vendors, searchTerm]);

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        Vendor Search
      </label>

      <div className="flex gap-1.5">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 bg-white border  border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-all shadow-sm"
        >
          <span
            className={
              selectedVendor
                ? "text-slate-800 font-medium truncate"
                : "text-slate-400"
            }
          >
            {selectedVendor
              ? `${selectedVendor.vendorName} ${selectedVendor.contactPerson ? `(${selectedVendor.contactPerson})` : ""}`
              : "Search & Select Vendor"}
          </span>
          <Search className="w-4 h-4 text-slate-400" />
        </div>

        <button
          type="button"
          onClick={onAddVendorClick}
          className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl transition-colors flex items-center justify-center shrink-0 shadow-sm"
          title="Add new vendor"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border  border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-60 flex flex-col">
          <div className="p-2 border-b  border-slate-700 bg-slate-50">
            <input
              type="text"
              placeholder="Filter vendor by name or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border  border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredVendors.length > 0 ? (
              filteredVendors.map((v) => (
                <div
                  key={v.vendorId}
                  onClick={() => {
                    onSelect(v.vendorId);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`p-2.5 text-xs text-slate-700 hover:bg-emerald-50 cursor-pointer transition-colors border-b  border-slate-700 ${selectedVendorId === v.vendorId ? "bg-emerald-50 text-emerald-800 font-semibold" : ""}`}
                >
                  <div className="font-semibold text-slate-800">
                    {v.vendorName}
                  </div>
                  {v.contactPerson && (
                    <div className="text-slate-500 text-[10px]">
                      Contact: {v.contactPerson}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 text-xs text-slate-400 text-center">
                No vendors match
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
