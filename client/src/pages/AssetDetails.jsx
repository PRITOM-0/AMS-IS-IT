import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Edit,
  Trash2,
  HardDrive,
  MapPin,
  ShieldCheck,
  Tag,
  Pencil,
  UserPlus,
  UserMinus,
  UserCheck,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { API_BASE_URL } from "../env";
import ReleaseAsset from "../components/ReleaseAsset";

const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const assetRes = await axios.get(`${API_BASE_URL}/assets/${id}`);
      const assetData = assetRes.data;
      setAsset(assetData);
      // Fetch employee information based on asset.employeeId
      if (assetData?.employeeId) {
        try {
          const employeesRes = await axios.get(`${API_BASE_URL}/employees`);

          const employees = employeesRes.data || [];

          const foundEmployee = employees.find(
            (employee) =>
              String(employee.id || "") ===
              String(assetData.employeeId || ""),
          );

          setEmployeeInfo(foundEmployee || null);
        } catch (employeeErr) {
          console.warn("Could not fetch employee details:", employeeErr);
          setEmployeeInfo(null);
        }
      } else {
        setEmployeeInfo(null);
      }
      if (assetData?.vendorId) {
        try {
          const vendorsRes = await axios.get(`${API_BASE_URL}/vendors`);
          const foundVendor = vendorsRes.data?.find(
            (v) => String(v.vendorId) === String(assetData.vendorId),
          );
          setVendorInfo(foundVendor || null);
        } catch (vErr) {
          console.warn("Could not fetch vendor details:", vErr);
        }
      }

      try {
        const tasksRes = await axios.get(`${API_BASE_URL}/tasks`);
        const relatedTasks = (tasksRes.data || []).filter((task) => {
          if (!task) return false;
          return (
            String(task.assetId || "") === String(assetData?.id || "") ||
            String(task.assetCode || "") ===
              String(assetData?.assetCode || "") ||
            String(task.assetName || "") === String(assetData?.equipment || "")
          );
        });
        setTasks(
          relatedTasks.sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
          ),
        );
      } catch (taskErr) {
        console.warn("Could not fetch related tasks:", taskErr);
        setTasks([]);
      }
    } catch (err) {
      console.error("Error fetching asset details:", err);
      setError("Asset not found or server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/assets/${id}`);
      navigate("/assets", {
        state: { message: "Asset deleted successfully!" },
      });
    } catch (err) {
      console.error("Error deleting asset:", err);
      alert("Failed to delete the asset. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-slate-600 font-medium">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-white text-slate-900 p-6 flex flex-col items-center justify-center">
        <div className="bg-white border border-red-600 rounded-xl p-8 max-w-md w-full text-center shadow-2xl shadow-red-100">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Error Loading Asset
          </h2>
          <p className="text-slate-600 mb-6">
            {error || "Asset does not exist."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "instock":
      case "ok":
        return "bg-emerald-100 border border-emerald-600 text-emerald-800";
      case "on process":
      case "repair/service":
      case "update":
        return "bg-amber-100 border border-amber-600 text-amber-800";
      case "inactive":
      case "pending":
      case "replace":
      case "removal":
        return "bg-red-100 border border-red-600 text-red-800";
      default:
        return "bg-indigo-100 border border-indigo-600 text-indigo-800";
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-900 shadow-xl">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-900 px-4 py-2 rounded-lg font-bold transition text-sm shadow-xl w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            <Link
              to={`/assets/editAsset/${asset.id}`}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border border-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-xl transition"
            >
              <Edit className="w-4 h-4" /> Edit Asset
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 border border-red-600 px-4 py-2 rounded-lg text-sm font-bold shadow-xl transition"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-indigo-600 p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 border border-indigo-600 rounded-xl text-indigo-700">
                <HardDrive className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-2xl font-black text-slate-900">
                    {asset.equipment || "Unknown Equipment"}
                  </h1>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(asset.status)}`}
                  >
                    {asset.status || "N/A"}
                  </span>
                </div>
                <p className="text-slate-600 text-sm font-mono">
                  Asset Code:{" "}
                  <span className="text-indigo-600 font-bold">
                    {asset.assetCode || "N/A"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="bg-slate-50 border border-slate-900 px-4 py-2 rounded-lg shadow-xl">
                <p className="text-xs font-bold text-slate-500 ">
                  Brand & Model
                </p>
                <p className="text-sm font-black text-slate-900">
                  {asset.brand || "—"} {asset.model ? `(${asset.model})` : ""}
                </p>
              </div>
              <div className="bg-slate-50 border border-emerald-600 px-4 py-2 rounded-lg shadow-xl">
                <p className="text-xs font-bold text-emerald-700 ">Company</p>
                <p className="text-sm font-black text-emerald-900">
                  {asset.company || "—"}
                </p>
              </div>
              <div className="bg-slate-50 border border-blue-600 px-4 py-2 rounded-lg shadow-xl">
                <p className="text-xs font-bold text-blue-700 ">
                  Survey Status
                </p>
                <p className="text-sm font-black text-blue-900">
                  {asset.surveyStatus || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-blue-500 p-5 shadow-xl">
              <div className="flex items-center justify-between gap-2 text-slate-900 pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center justify-center gap-2">
                  <HardDrive className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-black text-slate-900">
                    Asset Information
                  </h2>
                </div>
                <div className="flex py-2 items-center justify-center gap-2">
                  <p className="text-[11px] font-bold  text-slate-500">
                    Current Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${getStatusBadge(asset.status)}`}
                  >
                    {asset.status || "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">
                    Equipment
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    {asset.equipment || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">
                    Asset Code
                  </p>
                  <p className="font-mono font-bold text-slate-900 mt-1">
                    {asset.assetCode || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">Brand</p>
                  <p className="font-bold text-slate-900 mt-1">
                    {asset.brand || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">Model</p>
                  <p className="font-bold text-slate-900 mt-1">
                    {asset.model || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">
                    Serial Number
                  </p>
                  <p className="font-bold font-bold text-slate-900 mt-1">
                    {asset.serialNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">
                    MAC Address
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    {asset.macAddress || "N/A"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[11px] font-bold  text-slate-500">
                    Specifications
                  </p>
                  <p className="font-bold text-slate-900 whitespace-pre-wrap">
                    {asset.specifications || "No specifications added."}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-emerald-600 p-5 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-700 pb-3 border-b border-emerald-100 mb-4">
                <MapPin className="w-5 h-5" />
                <h2 className="font-black text-slate-900">Location</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">
                    Company
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    {asset.company || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">
                    Department
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    {asset.department || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">
                    Location
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    {asset.location || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">Floor</p>
                  <p className="font-bold text-slate-900 mt-1">
                    {asset.floor || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">Room</p>
                  <p className="font-bold text-slate-900 mt-1">
                    {asset.room ? ` ${asset.room}` : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-indigo-600 p-5 shadow-xl">
              <div className="flex items-center gap-2 text-indigo-700 pb-3 border-b border-indigo-100 mb-4">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="font-black text-slate-900">
                  Purchase, Warranty & Vendor
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">
                    Purchase Date
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    {asset.purchaseDate || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">
                    Purchase Price
                  </p>
                  <p className="font-bold text-emerald-600 mt-1">
                    {asset.purchasePrice ? `$${asset.purchasePrice}` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">
                    Warranty Start
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    {asset.warrantyStart || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">
                    Warranty End
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    {asset.warrantyEnd || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">
                    Warranty Period
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    {asset.warrantyYears
                      ? `${asset.warrantyYears} Year(s)`
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm">
                <p className="text-[11px] font-bold  text-indigo-700">
                  Vendor Details
                </p>
                <p className="font-bold text-indigo-900 mt-1">
                  {vendorInfo?.vendorName ||
                    asset.vendorId ||
                    "No Vendor Assigned"}
                </p>

                {vendorInfo && (
                  <div className="mt-2 grid grid-cols-3 gap-2 text-slate-700">
                    <div className="">
                      <p className="text-[11px] font-bold  text-slate-500">
                        Contact Person
                      </p>
                      <p className="font-mono font-bold text-slate-900 mt-1">
                        {vendorInfo.contactPerson || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold  text-slate-500">
                        Phone / Email
                      </p>
                      <p className="font-mono font-bold text-slate-900 mt-1">
                        {vendorInfo.contact || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold  text-slate-500">
                        Address
                      </p>
                      <p className="font-mono font-bold text-slate-900 mt-1">
                        {vendorInfo.address || "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-900 p-5 shadow-xl">
              <div className="flex items-center gap-2 text-slate-900 pb-3 border-b border-slate-200 mb-4">
                <FileText className="w-5 h-5 text-slate-700" />
                <h2 className="font-black text-slate-900">
                  Survey Information, Remarks & Upgrade Equipment
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">
                    Survey Status
                  </p>
                  <p className="font-bold text-blue-600 mt-1">
                    {asset.surveyStatus || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold  text-slate-500">
                    Survey Taken By
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    {asset.surveyTakenBy || asset.surveyer || "N/A"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[11px] font-bold  text-slate-500">
                    Upgrade Equipment
                  </p>
                  <p className=" font-bold text-slate-900   rounded-lg  whitespace-pre-wrap">
                    {asset.upgradeEquipments ||
                      "No upgrade equipment recorded."}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[11px] font-bold  text-slate-500">
                    Remarks
                  </p>
                  <p className=" font-bold text-slate-900   rounded-lg  whitespace-pre-wrap">
                    {asset.remarks || "No remarks added."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-indigo-500 p-5 shadow-xl self-start h-fit">
            <div className="flex items-center gap-2 text-slate-900 pb-3 border-b border-slate-200 mb-4">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="font-black text-slate-900">User Information</h2>
            </div>

            {employeeInfo ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                {/* Employee Name */}
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Employee Name
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    {employeeInfo.employeeName || "N/A"}
                  </p>
                </div>

                {/* Employee ID */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Employee ID
                  </p>
                  <p className="font-mono font-bold text-indigo-600 mt-1">
                    {employeeInfo.employeeId || "N/A"}
                  </p>
                </div>

                {/* Designation */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Designation
                  </p>
                  <p className="font-semibold text-slate-900 mt-1 truncate">
                    {employeeInfo.designation || "N/A"}
                  </p>
                </div>

                {/* Company */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Company
                  </p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {employeeInfo.company || "N/A"}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Location
                  </p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {employeeInfo.location || "N/A"}
                  </p>
                </div>

                {/* Department */}
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Department
                  </p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {employeeInfo.department || "N/A"}
                  </p>
                </div>
                <ReleaseAsset employee={employeeInfo} asset={asset} onReleased={(updatedAsset) => { console.log("Asset released:", updatedAsset); }} />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-400" />

                <p className="font-bold text-slate-600">No Employee Assigned</p>

                <p className="mt-1 text-xs text-slate-400">
                  This asset is currently not assigned to an employee.
                </p>
              </div>
            )}
            {Array.isArray(asset?.oldUsers) && asset.oldUsers.length > 0 && (
  <div className="mt-5 rounded-lg border border-gray-100 bg-white shadow-xs overflow-hidden">
    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-3 py-2">
      <h3 className="text-xs font-medium text-gray-600">History</h3>
      <span className="text-[10px] font-medium text-gray-400">
        {asset.oldUsers.length} recorded
      </span>
    </div>

    <div className="divide-y divide-gray-100">
      {[...asset.oldUsers]
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
        .map((oldUser, index) => (
          <div key={index} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50/80 transition-colors">
            <div className="min-w-0 pr-2">
              <p className="truncate text-xs font-medium text-gray-800">
                {oldUser.employeeName || "Unknown Employee"}
              </p>
              <p className="text-[10px] text-gray-400">
                Assigned: {oldUser.receivedDate ? new Date(oldUser.receivedDate).toLocaleDateString() : "N/A"}
              </p>
            </div>

            <div className="text-right whitespace-nowrap">
              <span className="inline-block rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                Released {oldUser.releaseDate ? new Date(oldUser.releaseDate).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        ))}
    </div>
  </div>
)}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xl">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 mb-4">
            <div className="flex items-center gap-2 text-slate-900">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="font-black text-slate-900">Task List</h2>
            </div>
            <span className="text-xs font-bold  text-slate-500">
              {tasks.length} related
            </span>
          </div>

          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id || task.taskId}
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold  text-slate-500">
                        {task.taskCode || "Task Code"}
                      </p>
                      <h3 className="font-bold text-slate-900">
                        {task.taskName || "Untitled Task"}
                      </h3>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusBadge(task.progress || task.status)}`}
                      >
                        {task.progress || task.status || "N/A"}
                      </span>
                      <span className="bg-indigo-100 border border-indigo-300 text-indigo-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                        {task.priority || "Medium"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-700">
                    <div>
                      <p className="text-[11px] font-bold  text-slate-500">
                        Issue
                      </p>
                      <p className="font-medium mt-1">
                        {task.issueSummary || "No issue summary."}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold  text-slate-500">
                        Requester
                      </p>
                      <p className="font-medium mt-1">
                        {task.username || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold  text-slate-500">
                        Assigned To
                      </p>
                      <p className="font-medium mt-1">
                        {task.itPersonName || "Unassigned"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500 bg-slate-50">
              No task records found for this asset.
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-red-600 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-black text-slate-900">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-sm text-slate-700 font-medium">
              Are you sure you want to delete asset{" "}
              <span className="font-mono font-bold text-red-600">
                {asset.assetCode}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white border border-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetails;
