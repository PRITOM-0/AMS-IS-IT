 
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Save,
  RotateCcw,
  User,
  Hash,
  Briefcase,
  Building2,
  MapPin,
  Layers,
  Package,
  History,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../env";

function EmployeeDetails() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [originalEmployee, setOriginalEmployee] = useState(null);
  const [formData, setFormData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [employeeResponse, assetsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/employees/${id}`),
          axios.get(`${API_BASE_URL}/assets`),
        ]);

        const employeeData = employeeResponse.data;
        const assetData = assetsResponse.data || [];

        setEmployee(employeeData);
        setOriginalEmployee(employeeData);
        setFormData(employeeData ? { ...employeeData } : null);
        setAssets(assetData);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getAsset = (assetId) => {
    return assets.find((asset) => String(asset.id) === String(assetId));
  };

  const handleEdit = () => {
    if (employee) {
      setFormData({ ...employee });
      setIsEdit(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!formData) return;

    try {
      setSaving(true);

      const updatedEmployee = {
        ...formData,
        employeeName: formData.employeeName?.trim() || "",
        employeeId: formData.employeeId?.trim() || "",
        designation: formData.designation?.trim() || "",
        company: formData.company?.trim() || "",
        location: formData.location?.trim() || "",
        department: formData.department?.trim() || "",
        updatedAt: new Date().toISOString(),

        // Preserve asset relationships
        assetlist: employee?.assetlist || [],
        assethistory: employee?.assethistory || [],
      };

      const response = await axios.put(
        `${API_BASE_URL}/employees/${id}`,
        updatedEmployee,
      );

      setEmployee(response.data);
      setOriginalEmployee(response.data);
      setFormData({ ...response.data });
      setIsEdit(false);
    } catch (error) {
      console.error("Error updating employee:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update employee. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalEmployee) {
      setFormData({ ...originalEmployee });
    }

    setIsEdit(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="text-gray-500">Loading employee...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-medium">Employee not found</p>

        <Link
          to="/employees"
          className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Employees
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* TOP BAR */}
      <div className="flex justify-between items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {!isEdit ? (
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Edit size={17} />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg transition"
            >
              <Save size={17} />
              {saving ? "Updating..." : "Update"}
            </button>

            <button
              onClick={handleReset}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg transition"
            >
              <RotateCcw size={17} />
              Reset
            </button>
          </div>
        )}
      </div>

      {/* EMPLOYEE INFORMATION */}
      <div className="bg-white border shadow-lg rounded-2xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-center gap-4">

            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <User size={28} />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-bold truncate">
                  {employee.employeeName || "Unnamed Employee"}
                </h1>

                <p className="text-sm text-blue-100 mt-1">
                  {employee.designation || "No Designation"}
                </p>
              </div>
            </div>

            <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">
              {employee.employeeId || "N/A"}
            </span>

          </div>
        </div>

        {/* DETAILS */}
        <div className="p-6">
          {isEdit ? (
            <div className="space-y-4">

              <EditableField
                label="Employee Name"
                icon={<User size={16} />}
                name="employeeName"
                value={formData?.employeeName || ""}
                onChange={handleChange}
              />

              <EditableField
                label="Employee ID"
                icon={<Hash size={16} />}
                name="employeeId"
                value={formData?.employeeId || ""}
                onChange={handleChange}
              />

              <EditableField
                label="Designation"
                icon={<Briefcase size={16} />}
                name="designation"
                value={formData?.designation || ""}
                onChange={handleChange}
              />

              <EditableField
                label="Company"
                icon={<Building2 size={16} />}
                name="company"
                value={formData?.company || ""}
                onChange={handleChange}
              />

              <EditableField
                label="Location"
                icon={<MapPin size={16} />}
                name="location"
                value={formData?.location || ""}
                onChange={handleChange}
              />

              <EditableField
                label="Department"
                icon={<Layers size={16} />}
                name="department"
                value={formData?.department || ""}
                onChange={handleChange}
              />

            </div>
          ) : (
            <div className="space-y-3">

              <InfoRow
                label="Employee Name"
                value={employee.employeeName}
                icon={<User size={16} />}
              />

              <InfoRow
                label="Employee ID"
                value={employee.employeeId}
                icon={<Hash size={16} />}
              />

              <InfoRow
                label="Designation"
                value={employee.designation}
                icon={<Briefcase size={16} />}
              />

              <InfoRow
                label="Company"
                value={employee.company}
                icon={<Building2 size={16} />}
              />

              <InfoRow
                label="Location"
                value={employee.location}
                icon={<MapPin size={16} />}
              />

              <InfoRow
                label="Department"
                value={employee.department}
                icon={<Layers size={16} />}
              />

            </div>
          )}
        </div>
      </div>

      {/* ASSIGNED ASSETS */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Package size={20} className="text-indigo-600" />
          <h2 className="font-semibold text-lg text-gray-800">
            Assigned Assets
          </h2>

          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
            {employee.assetlist?.length || 0}
          </span>
        </div>

        {!employee.assetlist || employee.assetlist.length === 0 ? (
          <div className="text-gray-500 text-sm bg-gray-50 border rounded-lg p-4 text-center">
            No assets assigned
          </div>
        ) : (
          <div className="space-y-2">
            {employee.assetlist.map((assetId) => {
              const asset = getAsset(assetId);

              return (
                <Link
                  to={`/assets/${assetId}`}
                  key={assetId}
                  className="block border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition bg-white"
                >
                  <div className="flex justify-between items-center gap-4">

                    <div className="min-w-0">
                      <p className="font-semibold text-indigo-600 truncate">
                        {asset?.equipment || "Asset"}
                      </p>

                      <div className="mt-1 space-y-1 text-xs text-gray-500">
                        <p>
                          <span className="font-medium">Asset Code:</span>{" "}
                          {asset?.assetCode || assetId}
                        </p>

                        <p>
                          <span className="font-medium">Brand:</span>{" "}
                          {asset?.brand || "N/A"}
                        </p>

                        <p>
                          <span className="font-medium">Model:</span>{" "}
                          {asset?.model || "N/A"}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded whitespace-nowrap">
                      Assigned
                    </span>

                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ASSET HISTORY */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History size={20} className="text-indigo-600" />
          <h2 className="font-semibold text-lg text-gray-800">
            Asset History
          </h2>

          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {employee.assethistory?.length || 0}
          </span>
        </div>

        {!employee.assethistory || employee.assethistory.length === 0 ? (
          <div className="text-gray-500 text-sm bg-gray-50 border rounded-lg p-4 text-center">
            No asset history available
          </div>
        ) : (
          <div className="space-y-2">
            {employee.assethistory.map((entry, index) => {
              const asset = getAsset(entry.assetId);

              return (
                <Link
                  to={`/assets/${entry.assetId}`}
                  key={`${entry.assetId}-${index}`}
                  className="block border rounded-xl p-4 shadow-sm bg-white hover:shadow-md hover:border-indigo-300 transition"
                >
                  <div className="flex justify-between items-start gap-4">

                    <div className="min-w-0">
                      <p className="font-semibold text-indigo-600 truncate">
                        {asset?.equipment || entry.assetId || "Asset"}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Asset Code:</span>{" "}
                        {asset?.assetCode || "N/A"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {entry?.issue || "Asset"}
                      </span>

                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          entry.returnedDate
                            ? "bg-gray-100 text-gray-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {entry.returnedDate ? "Returned" : "In Use"}
                      </span>
                    </div>

                  </div>

                  <div className="my-3 border-t" />

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Assigned:</span>{" "}
                      {entry.assignedDate || "—"}
                    </p>

                    <p>
                      <span className="font-medium">Returned:</span>{" "}
                      {entry.returnedDate || "—"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeDetails;

/* -------------------------------- */
/* INFO ROW */
/* -------------------------------- */

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
      <div className="w-40 flex items-center gap-2 text-gray-500 shrink-0">
        <span className="text-indigo-500">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>

      <span className="text-gray-800 font-medium">
        : {value || "N/A"}
      </span>
    </div>
  );
}

/* -------------------------------- */
/* EDITABLE FIELD */
/* -------------------------------- */

function EditableField({
  label,
  name,
  value,
  onChange,
  icon,
  type = "text",
}) {
  return (
    <label className="flex items-center gap-4 text-sm">
      <div className="w-40 flex items-center gap-2 text-gray-500 shrink-0">
        <span className="text-indigo-500">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
      />
    </label>
  );
}
 
