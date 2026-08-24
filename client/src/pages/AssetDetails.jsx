import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Save,
  RotateCcw,
  Edit,
  UserCheck,
} from "lucide-react";
import { API_BASE_URL } from "../env";
import IssueCard from "../components/IssueCard";

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [issues, setIssues] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic options extracted from existing DB data for edit mode suggestions
  const [dropdownOptions, setDropdownOptions] = useState({
    equipments: [],
    brands: [],
    departments: [],
    locations: [],
    floors: [],
    rooms: [],
    vendors: [],
    userNames: [],
    userCodes: [],
    userIds: [],
  });

  // Modal State for Deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [res, empRes, issuesRes, assetsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/assets/${id}`),
          fetch(`${API_BASE_URL}/employees`),
          fetch(`${API_BASE_URL}/issues`),
          fetch(`${API_BASE_URL}/assets`),
        ]);

        const [assetData, empData, issuesData, allAssetsData] =
          await Promise.all([
            res.json(),
            empRes.json(),
            issuesRes.json(),
            assetsRes.json(),
          ]);

        if (isMounted) {
          setAsset(assetData);
          const empList = Array.isArray(empData) ? empData : [];
          setEmployees(empList);
          setIssues(Array.isArray(issuesData) ? issuesData : []);
          setFormData(assetData);

          // Build dynamic options from existing DB records
          const assets = Array.isArray(allAssetsData) ? allAssetsData : [];

          const getUnique = (arr, key) =>
            Array.from(
              new Set(
                arr
                  .map((item) => (item[key] ? String(item[key]).trim() : ""))
                  .filter((val) => val !== ""),
              ),
            );

          setDropdownOptions({
            equipments: getUnique(assets, "equipment"),
            brands: getUnique(assets, "brand"),
            departments: getUnique(assets, "department"),
            locations: getUnique(assets, "location"),
            floors: getUnique(assets, "floor"),
            rooms: getUnique(assets, "room"),
            vendors: getUnique(assets, "vendorName"),
            userNames: Array.from(
              new Set([
                ...getUnique(assets, "userName"),
                ...getUnique(empList, "name"),
              ]),
            ),
            userCodes: Array.from(
              new Set([
                ...getUnique(assets, "userCode"),
                ...getUnique(empList, "employeeCode"),
              ]),
            ),
            userIds: Array.from(
              new Set([
                ...getUnique(assets, "userId"),
                ...getUnique(empList, "id"),
              ]),
            ),
          });
        }
      } catch (error) {
        console.error("Error fetching asset details:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading || !asset || !formData) {
    return (
      <p className="p-6 text-gray-600 font-medium">Loading asset details...</p>
    );
  }

  // Helper function to append previous user to oldUsers string
  const getUpdatedOldUsers = (currentFormData, newUserName, newUserCode) => {
    const prevUserName = asset?.userName;
    const prevUserCode = asset?.userCode;

    // Only update oldUsers if there was a previous user and it is changing to a different user
    if (prevUserName && prevUserName !== newUserName) {
      const prevEntry = prevUserCode
        ? `${prevUserName}-${prevUserCode}`
        : prevUserName;
      const currentOldUsers = currentFormData.oldUsers
        ? currentFormData.oldUsers.trim()
        : "";

      if (!currentOldUsers) {
        return prevEntry;
      }

      // Avoid adding duplicate entry if it's already recorded at the end
      if (!currentOldUsers.endsWith(prevEntry)) {
        return `${currentOldUsers}, ${prevEntry}`;
      }
    }
    return currentFormData.oldUsers;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      let updated = { ...prev, [field]: value };

      if (field === "userName") {
        updated.oldUsers = getUpdatedOldUsers(prev, value, prev.userCode);
      }

      if (field === "purchaseDate") {
        updated.warrantyStart = value;
      }

      return updated;
    });
  };

  // Quick select an existing employee to fill userId, userCode, userName automatically
  const handleSelectEmployee = (employeeId) => {
    const selectedEmp = employees.find((e) => e.id === employeeId);
    if (selectedEmp) {
      setFormData((prev) => {
        const newUserName = selectedEmp.name || "";
        const newUserCode = selectedEmp.employeeCode || "";
        const updatedOldUsers = getUpdatedOldUsers(
          prev,
          newUserName,
          newUserCode,
        );

        return {
          ...prev,
          userId: selectedEmp.id || "",
          userCode: newUserCode,
          userName: newUserName,
          oldUsers: updatedOldUsers,
        };
      });
    }
  };

  const handleReset = () => {
    setFormData(asset);
  };

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();

      const payload = {
        ...formData,
        updatedAt: now,
      };

      const res = await fetch(`${API_BASE_URL}/assets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updatedAsset = await res.json();
        setAsset(updatedAsset || payload);
        setFormData(updatedAsset || payload);
        setIsEdit(false);
      }
    } catch (error) {
      console.error("Failed to update asset:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await fetch(`${API_BASE_URL}/assets/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIsDeleteModalOpen(false);
        navigate(-1);
      }
    } catch (error) {
      console.error("Failed to delete asset:", error);
    } finally {
      setDeleting(false);
    }
  };

  // Find linked employee
  const employee = employees.find(
    (e) =>
      (formData.userCode && e.employeeCode === formData.userCode) ||
      (formData.userId && e.id === formData.userId),
  );

  const assetIssues = issues
    .filter((i) => i.assetId === asset.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      {/* DATALISTS FOR EDIT MODE DROPDOWN SUGGESTIONS FROM EXISTING DB DATA */}
      <datalist id="equipment-options">
        {dropdownOptions.equipments.map((opt, i) => (
          <option key={i} value={opt} />
        ))}
      </datalist>

      <datalist id="brand-options">
        {dropdownOptions.brands.map((opt, i) => (
          <option key={i} value={opt} />
        ))}
      </datalist>

      <datalist id="department-options">
        {dropdownOptions.departments.map((opt, i) => (
          <option key={i} value={opt} />
        ))}
      </datalist>

      <datalist id="location-options">
        {dropdownOptions.locations.map((opt, i) => (
          <option key={i} value={opt} />
        ))}
      </datalist>

      <datalist id="floor-options">
        {dropdownOptions.floors.map((opt, i) => (
          <option key={i} value={opt} />
        ))}
      </datalist>

      <datalist id="room-options">
        {dropdownOptions.rooms.map((opt, i) => (
          <option key={i} value={opt} />
        ))}
      </datalist>

      <datalist id="vendor-options">
        {dropdownOptions.vendors.map((opt, i) => (
          <option key={i} value={opt} />
        ))}
      </datalist>

      <datalist id="username-options">
        {dropdownOptions.userNames.map((opt, i) => (
          <option key={i} value={opt} />
        ))}
      </datalist>

      <datalist id="usercode-options">
        {dropdownOptions.userCodes.map((opt, i) => (
          <option key={i} value={opt} />
        ))}
      </datalist>

      <datalist id="userid-options">
        {dropdownOptions.userIds.map((opt, i) => (
          <option key={i} value={opt} />
        ))}
      </datalist>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 hover:text-white transition shadow-sm font-medium"
          >
            <ArrowLeft size={20} /> Back
          </button>

          <div className="flex items-center gap-2">
            {!isEdit ? (
              <>
                <button
                  onClick={() => setIsEdit(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-1.5 font-medium transition shadow-sm"
                >
                  <Edit size={16} /> Edit
                </button>

                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Save size={16} /> {isSubmitting ? "Updating..." : "Update"}
                </button>
                <button
                  onClick={handleReset}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-1.5 shadow-sm"
                >
                  <RotateCcw size={16} /> Reset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <EditableHeader
              value={formData.equipment}
              isEdit={isEdit}
              list="equipment-options"
              placeholder="Equipment Name"
              onChange={(v) => handleChange("equipment", v)}
            />
            <p className="text-blue-100 text-sm">
              Code:{" "}
              <EditableHeaderInline
                value={formData.assetCode}
                isEdit={isEdit}
                onChange={(v) => handleChange("assetCode", v)}
              />
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-right">
            <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">
              Current User
            </p>
            <p className="text-lg font-bold">
              {formData.userName || "Unassigned"}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* MAIN DETAILS (LEFT & MIDDLE COLUMNS) */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card title="Basic Details">
              <Grid col={3}>
                <Info
                  label="Equipment"
                  value={formData.equipment}
                  isEdit={isEdit}
                  list="equipment-options"
                  onChange={(v) => handleChange("equipment", v)}
                />
                <Info
                  label="Asset Code"
                  value={formData.assetCode}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("assetCode", v)}
                />
                <Info
                  label="Brand"
                  value={formData.brand}
                  isEdit={isEdit}
                  list="brand-options"
                  onChange={(v) => handleChange("brand", v)}
                />
                <Info
                  label="Model"
                  value={formData.model}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("model", v)}
                />
                <Info
                  label="Serial Number"
                  value={formData.serialNumber}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("serialNumber", v)}
                />
                <Info
                  label="MAC Address"
                  value={formData.macAddress}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("macAddress", v)}
                />
                <InfoSelect
                  label="Status"
                  value={formData.status}
                  isEdit={isEdit}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value,
                    }))
                  }
                  options={["Instock", "Active", "Inactive", "Removal"]}
                />
                <Info
                  colSpan="col-span-2"
                  label="Specifications"
                  value={formData.specifications}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("specifications", v)}
                />
              </Grid>
            </Card>

            {/* Location & Placement */}
            <Card title="Location & Placement">
              <Grid col={4}>
                <Info
                  label="Location"
                  value={formData.location}
                  isEdit={isEdit}
                  list="location-options"
                  onChange={(v) => handleChange("location", v)}
                />
                <Info
                  label="Department"
                  value={formData.department}
                  isEdit={isEdit}
                  list="department-options"
                  onChange={(v) => handleChange("department", v)}
                />
                <Info
                  label="Floor"
                  value={formData.floor}
                  isEdit={isEdit}
                  list="floor-options"
                  onChange={(v) => handleChange("floor", v)}
                />
                <Info
                  label="Room"
                  value={formData.room}
                  isEdit={isEdit}
                  list="room-options"
                  onChange={(v) => handleChange("room", v)}
                />
              </Grid>
            </Card>

            {/* Financial & Warranty */}
            <Card title="Financial & Warranty">
              <Grid col={3}>
                <Info
                  label="Purchase Price (BDT)"
                  value={formData.purchasePrice}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("purchasePrice", v)}
                />
                <Info
                  label="Vendor Name"
                  value={formData.vendorName}
                  isEdit={isEdit}
                  list="vendor-options"
                  onChange={(v) => handleChange("vendorName", v)}
                />
                <InfoDate
                  label="Purchase Date"
                  value={formData.purchaseDate}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("purchaseDate", v)}
                />
                <InfoDate
                  label="Warranty Start"
                  value={formData.warrantyStart}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("warrantyStart", v)}
                />
                <InfoDate
                  label="Warranty End Date"
                  value={formData.warrantyEnd}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("warrantyEnd", v)}
                />
              </Grid>
            </Card>

            {/* Remarks, Upgrades & Reports */}
            <Card title="Remarks, Upgrades & Reports">
              <Grid col={3}>
                <InfoSelect
                  label="Survey Report"
                  value={formData.surveyReport}
                  isEdit={isEdit}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      surveyReport: value,
                    }))
                  }
                  options={["OK", "Update", "Replace", "Repair/Service"]}
                />
                <Info
                  label="Upgrade Equipments"
                  value={formData.upgradeEquipments}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("upgradeEquipments", v)}
                />
                <Info
                  label="Remarks"
                  value={formData.remarks}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("remarks", v)}
                />
              </Grid>
            </Card>
          </div>

          {/* SIDEBAR (RIGHT COLUMN) */}
          <div className="space-y-6">
            {/* User & Assignment */}
            <Card title="User & Assignment Details">
              <div className="space-y-3">
                {isEdit && employees.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg space-y-1 mb-2">
                    <label className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                      <UserCheck size={14} /> Assign Existing Employee
                    </label>
                    <select
                      className="w-full border border-blue-300 rounded-md px-2 py-1.5 text-xs bg-white text-gray-800"
                      onChange={(e) => handleSelectEmployee(e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select employee to auto-fill...
                      </option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.employeeCode || emp.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Info
                  label="User Name"
                  value={formData.userName}
                  isEdit={isEdit}
                  list="username-options"
                  onChange={(v) => handleChange("userName", v)}
                />
                <Info
                  label="Employee ID"
                  value={formData.userCode}
                  isEdit={isEdit}
                  list="usercode-options"
                  onChange={(v) => handleChange("userCode", v)}
                />
                <Info
                  label="Old Users"
                  value={formData.oldUsers}
                  isEdit={isEdit}
                  placeholder="e.g. User A, User B"
                  onChange={(v) => handleChange("oldUsers", v)}
                />
                <InfoDate
                  label="Received Date"
                  value={formData.receivedDate}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("receivedDate", v)}
                />
              </div>
            </Card>

            {/* Linked Employee Info */}
            {employee && (
              <Card title="Assigned Employee Info">
                <div className="space-y-3">
                  <Info label="Name" value={employee.name} />
                  <Info label="Employee Code" value={employee.employeeCode} />
                  <Info label="Email" value={employee.email} />
                  <Info label="Department" value={employee.department} />
                  <Info label="Location" value={employee.location} />
                  <Info label="Contact" value={employee.contact} />
                </div>
              </Card>
            )}
          </div>

          {/* FULL WIDTH - ISSUES SECTION */}
          <div className="w-full col-span-1 md:col-span-3 space-y-3">
            <Card title={`Logged Issues (${assetIssues.length})`}>
              {assetIssues.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No issues logged for this asset.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {assetIssues.map((issue) => {
                    const emp = employees.find(
                      (e) => e.id === issue.employeeId,
                    );
                    return (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        asset={formData}
                        employee={emp}
                      />
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Delete Asset
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-800">
                    "{asset?.equipment || asset?.assetCode}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;

// Helper UI Components

const Card = ({ title, children }) => (
  <div className="border border-gray-200 bg-white p-5 rounded-2xl shadow-sm space-y-4">
    <h2 className="text-base font-bold text-blue-600 border-b border-gray-100 pb-2">
      {title}
    </h2>
    {children}
  </div>
);

const Grid = ({ children, col = 3 }) => {
  const colMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
  };
  return (
    <div className={`grid ${colMap[col] || "grid-cols-3"} gap-4 text-sm`}>
      {children}
    </div>
  );
};

const Info = ({
  label,
  value,
  isEdit,
  onChange,
  list,
  type = "text",
  colSpan = "",
  placeholder = "",
}) => (
  <div className={colSpan}>
    <p className="text-gray-500 text-xs mb-1 font-medium">{label}</p>
    {isEdit ? (
      <input
        type={type}
        list={list}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        value={typeof value === "string" ? value : (value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : label === "Old Users" && typeof value === "string" && value ? (
      <div className="flex flex-col gap-1.5 mt-2">
        {value
          .split(",")
          .map((user) => user.trim())
          .filter(Boolean)
          .reverse()
          .map((user, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-blue-500 w-fit"
            >
              {index+1}. {user}
            </span>
          ))}
      </div>
    ) : (
      <p className="font-semibold text-gray-800 break-words">
        {value || "---"}
      </p>
    )}
  </div>
);
const InfoSelect = ({
  label,
  value,
  isEdit,
  onChange,
  options = [],
  colSpan = "",
}) => (
  <div className={colSpan}>
    <p className="text-gray-500 text-xs mb-1 font-medium">{label}</p>

    {isEdit ? (
      <select
        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-black text-sm   focus:ring-2 focus:ring-blue-500 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    ) : (
      <p className="font-semibold text-gray-800 break-words">
        {value || "---"}
      </p>
    )}
  </div>
);

const InfoDate = ({ label, value, isEdit, onChange }) => {
  const formattedDate = value ? value.toString().split("T")[0] : "";

  return (
    <div>
      <p className="text-gray-500 text-xs mb-1 font-medium">{label}</p>
      {isEdit ? (
        <input
          type="date"
          className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={formattedDate}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p className="font-semibold text-gray-800">
          {value ? new Date(value).toLocaleDateString() : "---"}
        </p>
      )}
    </div>
  );
};

const EditableHeader = ({ value, isEdit, onChange, placeholder, list }) =>
  isEdit ? (
    <input
      list={list}
      className="text-2xl font-bold bg-white/20 border border-white/50 text-white placeholder-white/70 px-3 py-1 rounded-lg outline-none w-full max-w-md"
      value={value || ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  ) : (
    <h1 className="text-2xl font-bold tracking-tight">{value || "---"}</h1>
  );

const EditableHeaderInline = ({ value, isEdit, onChange }) =>
  isEdit ? (
    <input
      className="bg-white/20 border border-white/50 text-white font-semibold px-2 py-0.5 rounded outline-none"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  ) : (
    <span className="font-semibold">{value || "---"}</span>
  );
