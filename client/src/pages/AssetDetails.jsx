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
  UserCheck,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { API_BASE_URL } from "../env";

const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [vendorInfo, setVendorInfo] = useState(null);
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

      // 1. Fetch asset directly by ID
      const assetRes = await axios.get(`${API_BASE_URL}/assets/${id}`);
      const assetData = assetRes.data;
      setAsset(assetData);

      // 2. Fetch vendor info if vendorId exists
      if (assetData?.vendorId) {
        try {
          const vendorsRes = await axios.get(`${API_BASE_URL}/vendors`);
          const foundVendor = vendorsRes.data?.find(
            (v) => String(v.vendorId) === String(assetData.vendorId)
          );
          setVendorInfo(foundVendor || null);
        } catch (vErr) {
          console.warn("Could not fetch vendor details:", vErr);
        }
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
      navigate("/assets", { state: { message: "Asset deleted successfully!" } });
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
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Asset</h2>
          <p className="text-slate-600 mb-6">{error || "Asset does not exist."}</p>
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
        {/* Navigation Bar */}
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

        {/* Header Summary Card */}
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
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(asset.status)}`}>
                    {asset.status || "N/A"}
                  </span>
                </div>
                <p className="text-slate-600 text-sm font-mono">
                  Asset Code: <span className="text-indigo-600 font-bold">{asset.assetCode || "N/A"}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="bg-slate-50 border border-slate-900 px-4 py-2 rounded-lg shadow-xl">
                <p className="text-xs font-bold text-slate-500 uppercase">Brand & Model</p>
                <p className="text-sm font-black text-slate-900">
                  {asset.brand || "—"} {asset.model ? `(${asset.model})` : ""}
                </p>
              </div>
              <div className="bg-slate-50 border border-emerald-600 px-4 py-2 rounded-lg shadow-xl">
                <p className="text-xs font-bold text-emerald-700 uppercase">Company</p>
                <p className="text-sm font-black text-emerald-900">{asset.company || "—"}</p>
              </div>
              <div className="bg-slate-50 border border-blue-600 px-4 py-2 rounded-lg shadow-xl">
                <p className="text-xs font-bold text-blue-700 uppercase">Survey Status</p>
                <p className="text-sm font-black text-blue-900">{asset.surveyStatus || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Technical Specifications */}
          <div className="bg-white rounded-xl border border-blue-600 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-blue-700 pb-3 border-b-2 border-blue-100">
              <Tag className="w-5 h-5" />
              <h2 className="font-black text-slate-900">Equipment & Specifications</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Serial Number</p>
                <p className="font-mono font-bold text-slate-900 mt-1">{asset.serialNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">MAC Address</p>
                <p className="font-mono font-bold text-slate-900 mt-1">{asset.macAddress || "N/A"}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Specifications</p>
              <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-900 whitespace-pre-wrap font-medium">
                {asset.specifications || "No detailed specifications recorded."}
              </p>
            </div>

            {asset.upgradeEquipments && (
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase mb-1">Upgrades</p>
                <p className="text-sm text-amber-900 bg-amber-50 border border-amber-600 p-3 rounded-lg font-medium">
                  {asset.upgradeEquipments}
                </p>
              </div>
            )}
          </div>

          {/* Location & Department */}
          <div className="bg-white rounded-xl border border-emerald-600 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 pb-3 border-b-2 border-emerald-100">
              <MapPin className="w-5 h-5" />
              <h2 className="font-black text-slate-900">Location & Department</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Company</p>
                <p className="font-bold text-slate-900 mt-1">{asset.company || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Department</p>
                <p className="font-bold text-slate-900 mt-1">{asset.department || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Location</p>
                <p className="font-bold text-slate-900 mt-1">{asset.location || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Floor & Room</p>
                <p className="font-bold text-slate-900 mt-1">
                  {asset.floor ? `Floor: ${asset.floor}` : "N/A"}
                  {asset.room ? `, Room: ${asset.room}` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Procurement & Warranty */}
          <div className="bg-white rounded-xl border border-indigo-600 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 pb-3 border-b-2 border-indigo-100">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="font-black text-slate-900">Procurement & Warranty</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Purchase Date</p>
                <p className="font-bold text-slate-900 mt-1">{asset.purchaseDate || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Purchase Price</p>
                <p className="font-bold text-emerald-600 mt-1">
                  {asset.purchasePrice ? `$${asset.purchasePrice}` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Warranty Period</p>
                <p className="font-bold text-slate-900 mt-1">
                  {asset.warrantyYears ? `${asset.warrantyYears} Year(s)` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Warranty End</p>
                <p className="font-bold text-slate-900 mt-1">{asset.warrantyEnd || "N/A"}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Vendor Details</p>
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-600 text-sm">
                <p className="font-bold text-indigo-900">
                  {vendorInfo?.vendorName || asset.vendorId || "No Vendor Assigned"}
                </p>
                {vendorInfo && (
                  <div className="text-xs text-slate-700 mt-1 space-y-0.5 font-medium">
                    {vendorInfo.contactPerson && <p>Contact: {vendorInfo.contactPerson}</p>}
                    {vendorInfo.contact && <p>Phone/Email: {vendorInfo.contact}</p>}
                    {vendorInfo.address && <p>Address: {vendorInfo.address}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Governance & Assignment */}
          <div className="bg-white rounded-xl border border-slate-900 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-slate-900 pb-3 border-b-2 border-slate-200">
              <UserCheck className="w-5 h-5" />
              <h2 className="font-black text-slate-900">Employee Information</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Assigned Employee ID</p>
                <p className="font-mono font-bold text-slate-900 mt-1">{asset.employeeId || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Received Date</p>
                <p className="font-bold text-slate-900 mt-1">{asset.receivedDate || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Surveyor / Auditor</p>
                <p className="font-bold text-indigo-600 mt-1">{asset.surveyer || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Survey Status</p>
                <p className="font-bold text-blue-600 mt-1">{asset.surveyStatus || "N/A"}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Previous Users Log</p>
              {asset.oldUsers && asset.oldUsers.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {asset.oldUsers.map((user, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-100 border border-slate-900 font-bold text-slate-900 px-2.5 py-1 rounded-md"
                    >
                      {user}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No past user history recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        {asset.remarks && (
          <div className="bg-white rounded-xl border border-slate-900 p-5 shadow-xl">
            <div className="flex items-center gap-2 text-slate-900 pb-2 border-b-2 border-slate-200 mb-3">
              <FileText className="w-5 h-5" />
              <h2 className="font-black text-slate-900">Remarks & Notes</h2>
            </div>
            <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-900 whitespace-pre-wrap font-medium">
              {asset.remarks}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-red-600 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-black text-slate-900">Confirm Deletion</h3>
            </div>
            <p className="text-sm text-slate-700 font-medium">
              Are you sure you want to delete asset{" "}
              <span className="font-mono font-bold text-red-600">{asset.assetCode}</span>? This action cannot be undone.
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
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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