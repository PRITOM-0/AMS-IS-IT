import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "../env";
import IssueCard from "../components/IssueCard";

const AssetDetail = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [issues, setIssues] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${API_BASE_URL}/assets/${id}`);
      const empRes = await fetch(`${API_BASE_URL}/employees`);
      const issuesRes = await fetch(`${API_BASE_URL}/issues`);

      const assetData = await res.json();
      const empData = await empRes.json();
      const issuesData = await issuesRes.json();

      setAsset(assetData);
      setEmployees(empData);
      setIssues(issuesData);
      setFormData(assetData);
    };

    fetchData();
  }, [id]);

  if (!asset || !formData) return <p className="p-6">Loading...</p>;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleReset = () => {
    setFormData(asset);
  };

  const handleUpdate = async () => {
    await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setAsset(formData);
    setIsEdit(false);
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
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-blue-600"
          >
            <ArrowLeft size={24} /> Back
          </button>

          {!isEdit ? (
            <button
              onClick={() => setIsEdit(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Update
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* 🔹 Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl flex justify-between">
          <Editable value={formData.equipment} />
          <Editable value={formData.assetCode} />
          <Editable
            value={formData.userDetails?.userName || "---"}
            isEdit={false}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic */}
            <Card title="Asset Information">
              <Grid>
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
              <Grid>
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
                  label="Location"
                  value={formData.location}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("location", v)}
                />
                <Info
                  label="Floor"
                  value={`${formData.floor} th`}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("floor", v)}
                />
              </Grid>
            </Card>
            

            {/* Purchase & Warranty */}
            <Card title="Purchase & Warranty">
              <Grid>
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
                 <InfoDate
                  label="Vendor"
                  value={formData.vendorName}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("vendorName", v)}
                />
                <InfoDate
                  label="Warranty Start"
                  value={formData.warranty?.start}
                  isEdit={isEdit}
                  onChange={(v) => handleNestedChange("warranty", "start", v)}
                />
                <InfoDate
                  label="Warranty End"
                  value={formData.warranty?.end}
                  isEdit={isEdit}
                  onChange={(v) => handleNestedChange("warranty", "end", v)}
                />
              </Grid>
            </Card>

            {/* Additional Details */}
            <Card title="Additional Details">
              <Grid>
                <Info
                  label="Remaks"
                  value={formData.remarks}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("remarks", v)}
                />
                <Info
                  label="Survey Report"
                  value="---"
                />
                </Grid>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <Card title="Asset User">
              <Info
                label="Assigned To"
                value={asset?.userDetails?.userName || "---"}
              />
              <InfoDate
                label="Assigned Date"
                value={asset.userDetails?.receivedDate}
              />
              {employee && (
              <Card title="Employee Info">
                <Info label="Name" value={employee.name} />
                <Info label="Email" value={employee.email} />
                <Info label="Location" value={employee.location} />
                <Info label="Contact" value={employee.contact} />
              </Card>
            )}
            </Card>
          </div>

          {/*under*/}
          <div className="w-full col-span-3 space-y-3">
            {/* Issues */}
            <Card title={`Issues (${assetIssues.length})`}>
              <div className="grid grid-cols-3 gap-2">
                {assetIssues.map((issue) => {
                  const employee = employees.find(
                    (e) => e.id === issue.employeeId,
                  );
                  const asset = formData;
                  // Since we're already in the context of this asset
                  return (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      asset={asset}
                      employee={employee}
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

/////////////////////////////////////////////////////

const Card = ({ title, children }) => (
  <div className="border border-gray-400 text-black bg-gradient-to-br from-emerald-100 via-white to-teal-100 p-5 rounded-xl shadow-lg">
    <h2 className="text-lg font-semibold mb-4 text-indigo-600">{title}</h2>
    {children}
  </div>
);

const Grid = ({ children, col=3 }) => (
  <div className="grid grid-cols-3 gap-4 text-sm">{children}</div>
);

const Info = ({ label, value, isEdit, onChange }) => (
  <div>
    <p className="text-gray-500 text-xs">{label}</p>
    {isEdit ? (
      <input
        className="mt-1 w-full border rounded px-2 py-1 text-sm"
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
      className="text-white border border-white font-bold px-2 py-1 rounded"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  ) : (
    <h1 className="text-2xl font-bold">{value}</h1>
  );

const InfoSelect = ({ label, value, isEdit, options = [], onChange }) => {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>

      {isEdit ? (
        <select
          className="mt-1 w-full border rounded px-2 py-1 text-sm"
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
};

const InfoDate = ({ label, value, isEdit, onChange }) => {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>

      {isEdit ? (
        <input
          type="date"
          className="mt-1 w-full border rounded px-2 py-1 text-sm"
          value={value ? value : ""}
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
