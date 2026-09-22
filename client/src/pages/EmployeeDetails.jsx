 
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Save,
  RotateCcw,
  Trash2,
  User,
  Hash,
  Briefcase,
  Building2,
  MapPin,
  Layers,
  Package,
  History,
  X,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../env";

const fields = [
  ["employeeName", "Employee Name", User],
  ["employeeId", "Employee ID", Hash],
  ["designation", "Designation", Briefcase],
  ["company", "Company", Building2],
  ["location", "Location", MapPin],
  ["department", "Department", Layers],
];

function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [lists, setLists] = useState({});
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [employeeRes, assetsRes, listRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/employees/${id}`),
        axios.get(`${API_BASE_URL}/assets`),
        axios.get(`${API_BASE_URL}/list`),
      ]);

      setEmployee(employeeRes.data);
      setFormData({ ...employeeRes.data });
      setAssets(assetsRes.data || []);

      setLists({
        company: listRes.data?.company || [],
        location: listRes.data?.Location || [],
        department: listRes.data?.department || [],
      });
    } catch (error) {
      console.error("Failed to load employee:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAsset = (assetId) =>
    assets.find((asset) => String(asset._id) === String(assetId));

  const handleChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const handleEdit = () => {
    setFormData({ ...employee });
    setEdit(true);
  };

  const handleReset = () => {
    setFormData({ ...employee });
    setEdit(false);
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);

      const data = {
        ...formData,
        employeeName: formData.employeeName?.trim() || "",
        employeeId: formData.employeeId?.trim() || "",
        designation: formData.designation?.trim() || "",
        company: formData.company?.trim() || "",
        location: formData.location?.trim() || "",
        department: formData.department?.trim() || "",
        updatedAt: new Date().toISOString(),

        assetlist: employee.assetlist || [],
        assethistory: employee.assethistory || [],
      };

      const response = await axios.put(
        `${API_BASE_URL}/employees/${id}`,
        data
      );

      setEmployee(response.data);
      setFormData({ ...response.data });
      setEdit(false);
    } catch (error) {
      console.error("Update failed:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update employee. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`${API_BASE_URL}/employees/${id}`);

      navigate("/employees", {
        replace: true,
        state: {
          message: "Employee deleted successfully.",
        },
      });
    } catch (error) {
      console.error("Delete failed:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete employee. Please try again."
      );
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          Loading employee...
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle size={28} />
        </div>

        <h2 className="mt-4 text-xl font-semibold text-gray-800">
          Employee not found
        </h2>

        <Link
          to="/employees"
          className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:underline"
        >
          <ArrowLeft size={17} />
          Back to Employees
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* TOP BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 font-medium text-gray-600 transition hover:text-indigo-600"
          >
            <ArrowLeft size={19} />
            Back
          </button>

          <div className="flex gap-2">
            {!edit ? (
              <>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={() => setShowDelete(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* EMPLOYEE PROFILE */}
        <section className="overflow-hidden rounded-2xl border border-indigo-700 bg-white shadow-sm">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-6 text-white md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur">
                <User size={38} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-sm text-blue-100">
                  Employee Profile
                </p>

                <h1 className="truncate text-2xl font-bold md:text-3xl">
                  {employee.employeeName || "Unnamed Employee"}
                </h1>

                <p className="mt-1 text-blue-100">
                  {employee.designation || "No designation"}
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-medium">
                <Hash size={15} />
                {employee.employeeId || "N/A"}
              </span>
            </div>
          </div>

          {/* DETAILS */}
          <div className="p-5 md:p-7">
            {edit ? (
              <div className="grid gap-5 md:grid-cols-2">
                {fields.map(([name, label, Icon]) =>
                  ["company", "location", "department"].includes(name) ? (
                    <SelectField
                      key={name}
                      name={name}
                      label={label}
                      icon={Icon}
                      value={formData?.[name] || ""}
                      options={lists[name] || []}
                      onChange={handleChange}
                    />
                  ) : (
                    <InputField
                      key={name}
                      name={name}
                      label={label}
                      icon={Icon}
                      value={formData?.[name] || ""}
                      onChange={handleChange}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map(([name, label, Icon]) => (
                  <InfoRow
                    key={name}
                    label={label}
                    value={employee[name]}
                    icon={<Icon size={17} />}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ASSIGNED ASSETS */}
        <section>
          <SectionTitle
            title="Assigned Assets"
            icon={<Package size={19} />}
            count={employee.assetlist?.length || 0}
          />

          {!employee.assetlist?.length ? (
            <EmptyState text="No assets currently assigned." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {employee.assetlist.map((assetId) => (
                <AssetCard
                  key={assetId}
                  assetId={assetId}
                  asset={getAsset(assetId)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ASSET HISTORY */}
        <section>
          <SectionTitle
            title="Asset History"
            icon={<History size={19} />}
            count={employee.assethistory?.length || 0}
          />

          {!employee.assethistory?.length ? (
            <EmptyState text="No asset history available." />
          ) : (
            <div className="space-y-3">
              {employee.assethistory.map((entry, index) => {
                const asset = getAsset(entry.assetId);

                return (
                  <Link
                    key={`${entry.assetId}-${index}`}
                    to={`/assets/${entry.assetId}`}
                    className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-indigo-600">
                          {asset?.equipment ||
                            entry.assetId ||
                            "Asset"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Asset Code: {asset?.assetCode || "N/A"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge color="yellow">
                          {entry.issue || "Asset"}
                        </Badge>

                        <Badge
                          color={
                            entry.returnedDate ? "gray" : "green"
                          }
                        >
                          {entry.returnedDate ? "Returned" : "In Use"}
                        </Badge>
                      </div>
                    </div>

                    <div className="my-4 border-t border-gray-100" />

                    <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                      <p>
                        <span className="font-medium text-gray-800">
                          Assigned:
                        </span>{" "}
                        {entry.assignedDate || "—"}
                      </p>

                      <p>
                        <span className="font-medium text-gray-800">
                          Returned:
                        </span>{" "}
                        {entry.returnedDate || "—"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDelete && (
        <DeleteModal
          employee={employee}
          deleting={deleting}
          onCancel={() => !deleting && setShowDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

/* ---------------- INFO ROW ---------------- */

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
      <span className="mt-0.5 shrink-0 text-indigo-600">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>

        <p className="mt-1 break-words font-medium text-gray-800">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

/* ---------------- INPUT ---------------- */

function InputField({
  label,
  name,
  value,
  onChange,
  icon: Icon,
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
        <Icon size={16} className="text-indigo-500" />
        {label}
      </span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}

/* ---------------- SELECT ---------------- */

function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  icon: Icon,
}) {
  const availableOptions =
    value && !options.includes(value)
      ? [value, ...options]
      : options;

  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
        <Icon size={16} className="text-indigo-500" />
        {label}
      </span>

      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">
            Select {label.toLowerCase()}
          </option>

          {availableOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={17}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </label>
  );
}

/* ---------------- SECTION TITLE ---------------- */

function SectionTitle({ title, icon, count }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-indigo-600">{icon}</span>

      <h2 className="text-lg font-semibold text-gray-800">
        {title}
      </h2>

      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
        {count}
      </span>
    </div>
  );
}

/* ---------------- EMPTY STATE ---------------- */

function EmptyState({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-7 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}

/* ---------------- ASSET CARD ---------------- */

function AssetCard({ asset, assetId }) {
  return (
    <Link
      to={`/assets/${assetId}`}
      className="group rounded-xl border border-gray-500 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Package size={19} />
        </div>

        <Badge color="green">Assigned</Badge>
      </div>

      <h3 className="mt-4 truncate font-semibold text-gray-800 transition group-hover:text-indigo-600">
        {asset?.equipment || "Asset"}
      </h3>

      <div className="mt-2 space-y-1 text-xs text-gray-500">
        <p>
          <span className="font-medium text-gray-700">
            Code:
          </span>{" "}
          {asset?.assetCode || assetId}
        </p>

        <p>
          <span className="font-medium text-gray-700">
            Brand:
          </span>{" "}
          {asset?.brand || "N/A"}
        </p>

        <p>
          <span className="font-medium text-gray-700">
            Model:
          </span>{" "}
          {asset?.model || "N/A"}
        </p>
      </div>
    </Link>
  );
}

/* ---------------- BADGE ---------------- */

function Badge({ children, color }) {
  const styles = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-800",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-medium ${styles[color]}`}
    >
      {children}
    </span>
  );
}

/* ---------------- DELETE MODAL ---------------- */

function DeleteModal({
  employee,
  deleting,
  onCancel,
  onConfirm,
}) {
  const assetCount = employee.assetlist?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={28} />
          </div>

          <h2 className="mt-4 text-center text-xl font-bold text-gray-900">
            Delete Employee?
          </h2>

          <p className="mt-2 text-center text-sm leading-6 text-gray-500">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-gray-800">
              {employee.employeeName || "this employee"}
            </span>
            ?
          </p>

          {assetCount > 0 && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              <div className="flex gap-3">
                <AlertTriangle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <p>
                  This employee currently has{" "}
                  <strong>{assetCount}</strong> assigned{" "}
                  {assetCount === 1 ? "asset" : "assets"}.
                  Their <code>employeeId</code> will be cleared
                  from those assets before deletion.
                </p>
              </div>
            </div>
          )}

          <p className="mt-4 text-center text-xs text-gray-400">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3 border-t border-gray-100 bg-gray-50 p-4">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <X size={16} />
              Cancel
            </span>
          </button>

          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <Trash2 size={16} />
                Delete
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetails;
 