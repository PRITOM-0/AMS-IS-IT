import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [res, empRes, issuesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/assets/${id}`),
          fetch(`${API_BASE_URL}/employees`),
          fetch(`${API_BASE_URL}/issues`),
        ]);

        const [assetData, empData, issuesData] = await Promise.all([
          res.json(),
          empRes.json(),
          issuesRes.json(),
        ]);

        if (isMounted) {
          setAsset(assetData);
          setEmployees(empData);
          setIssues(issuesData);
          setFormData(assetData);
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

  if (loading || !asset || !formData) return <p className="p-6">Loading...</p>;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFormData(asset);
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/assets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setAsset(formData);
        setIsEdit(false);
      }
    } catch (error) {
      console.error("Failed to update asset:", error);
    }
  };

  const employee = employees.find(
    (e) => e.employeeCode === formData.userDetails?.userCode,
  );

  const assetIssues = issues
    .filter((i) => i.assetId === asset.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 🔹 Top Bar */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
          >
            <ArrowLeft size={24} /> Back
          </button>

          {!isEdit ? (
            <button
              onClick={() => setIsEdit(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Update
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* 🔹 Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl flex justify-between items-center">
          <Editable
            value={formData.equipment}
            isEdit={isEdit}
            onChange={(v) => handleChange("equipment", v)}
          />
          <Editable
            value={formData.assetCode}
            isEdit={isEdit}
            onChange={(v) => handleChange("assetCode", v)}
          />
          <Editable value={formData.userName || "---"} isEdit={false} />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card title="Asset Information">
              <Grid col={4}>
                <Info
                  label="Equipment"
                  value={formData.equipment}
                  isEdit={isEdit}
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
                  label="Specifications/Configuration"
                  value={formData.specifications}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("specifications", v)}
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
                  onChange={(val) => handleChange("status", val)}
                  options={["Active", "Maintenance", "Inactive", "Instore"]}
                />
              </Grid>
            </Card>

            {/* Location */}
            <Card title="Location">
              <Grid col={4}>
                <Info
                  label="Location"
                  value={formData.location}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("location", v)}
                />
                <Info
                  label="Department"
                  value={formData.department}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("department", v)}
                />
                <Info
                  label="Floor"
                  value={formData.floor}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("floor", v)}
                />
                <Info
                  label="Room"
                  value={formData.room}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("room", v)}
                />
              </Grid>
            </Card>

            {/* Purchase & Warranty */}
            <Card title="Purchase & Warranty">
              <Grid col={4}>
                <Info
                  label="Purchase Price"
                  value={formData.purchasePrice}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("purchasePrice", v)}
                />
                <InfoDate
                  label="Purchase Date"
                  value={formData.purchaseDate}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("purchaseDate", v)}
                />
                <Info
                  label="Vendor Name"
                  value={formData.vendorName}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("vendorName", v)}
                />
                <InfoDate
                  label="Warranty Start"
                  value={formData.warrantyStart}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("warrantyStart", v)}
                />
                <InfoDate
                  label="Warranty End"
                  value={formData.warrantyEnd}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("warrantyEnd", v)}
                />
              </Grid>
            </Card>

            {/* Additional Details */}
            <Card title="Additional Details">
              <Grid col={2}>
                <Info
                  label="Remarks"
                  value={formData.remarks}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("remarks", v)}
                />
                <Info
                  label="Survey Report"
                  value={formData.surveyReport}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("surveyReport", v)}
                />
              </Grid>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <Card title="Asset User">
              <div className="space-y-3">
                <Info
                  label="Assigned To"
                  value={asset?.userName || "---"}
                />
                <InfoDate
                  label="Assigned Date"
                  value={asset?.receivedDate}
                />
              </div>
            </Card>

            {employee && (
              <Card title="Employee Info">
                <div className="space-y-3">
                  <Info label="Name" value={employee.name} />
                  <Info label="Email" value={employee.email} />
                  <Info label="Location" value={employee.location} />
                  <Info label="Contact" value={employee.contact} />
                </div>
              </Card>
            )}
          </div>

          {/* Bottom - Issues */}
          <div className="w-full col-span-3 space-y-3">
            <Card title={`Issues (${assetIssues.length})`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assetIssues.map((issue) => {
                  const emp = employees.find((e) => e.id === issue.employeeId);
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
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;

// Helper Components

const Card = ({ title, children }) => (
  <div className="border border-gray-300 text-black bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 rounded-xl shadow-sm">
    <h2 className="text-lg font-semibold mb-4 text-indigo-600">{title}</h2>
    {children}
  </div>
);

const Grid = ({ children, col = 4 }) => {
  const colMap = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };
  return (
    <div className={`grid ${colMap[col] || "grid-cols-4"} gap-4 text-sm`}>
      {children}
    </div>
  );
};

const Info = ({ label, value, isEdit, onChange }) => (
  <div>
    <p className="text-gray-500 text-xs">{label}</p>
    {isEdit ? (
      <input
        className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <p className="font-medium">{value || "---"}</p>
    )}
  </div>
);

const Editable = ({ value, isEdit, onChange }) =>
  isEdit ? (
    <input
      className="text-white bg-white/20 border border-white font-bold px-2 py-1 rounded outline-none"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  ) : (
    <h1 className="text-2xl font-bold">{value || "---"}</h1>
  );

const InfoSelect = ({ label, value, isEdit, options = [], onChange }) => (
  <div>
    <p className="text-gray-500 text-xs">{label}</p>
    {isEdit ? (
      <select
        className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    ) : (
      <p className="font-medium">{value || "---"}</p>
    )}
  </div>
);

const InfoDate = ({ label, value, isEdit, onChange }) => {
  const formattedDate = value ? value.toString().split("T")[0] : "";

  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      {isEdit ? (
        <input
          type="date"
          className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white"
          value={formattedDate}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p className="font-medium">
          {value ? new Date(value).toLocaleDateString() : "---"}
        </p>
      )}
    </div>
  );
};