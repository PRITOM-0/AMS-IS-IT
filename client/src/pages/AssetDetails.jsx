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
    (e) => e.employeeCode === formData.assignDetails?.employeeCode,
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
          <Editable
            value={formData.name}
            isEdit={isEdit}
            onChange={(v) => handleChange("name", v)}
          />
          <Editable
            value={formData.assetCode}
            isEdit={isEdit}
            onChange={(v) => handleChange("assetCode", v)}
          />
          <Editable value={formData.assignDetails?.assignedTo || "Unassigned"} isEdit={false} />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic */}
            <Card title="Asset Information">
              <Grid>
                <Info
                  label="Brand"
                  value={formData.brand}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("brand", v)}
                />
                <Info
                  label="Category"
                  value={formData.category}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("category", v)}
                />

                <InfoSelect
                  label="Status"
                  value={formData.status}
                  isEdit={isEdit}
                  onChange={(val) => handleChange("status", val)}
                  options={["Active","Maintenance", "Inactive", "Instore"]}
                />
                <Info
                  label="Location"
                  value={formData.location}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("location", v)}
                />
                <InfoDate
                  label="Purchase Date"
                  value={formData.purchaseDate}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("purchaseDate", v)}
                />
                <Info
                  label="Value"
                  value={formData.value}
                  isEdit={isEdit}
                  onChange={(v) => handleChange("value", v)}
                />
              </Grid>
            </Card>

            {/* Warranty */}
            <Card title="Warranty">
              <Grid>
                <InfoDate
                  label="Start"
                  value={formData.warranty?.start}
                  isEdit={isEdit}
                  onChange={(v) => handleNestedChange("warranty", "start", v)}
                />
                <InfoDate
                  label="End"
                  value={formData.warranty?.end}
                  isEdit={isEdit}
                  onChange={(v) => handleNestedChange("warranty", "end", v)}
                />
              </Grid>
            </Card>

            {/* Description */}
            <Card title="Description">
              {isEdit ? (
                <textarea
                  className="w-full border p-2 rounded"
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              ) : (
                <p>{formData.description}</p>
              )}
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <Card title="Assignment">
              <Info
                label="Assigned To"
                value={asset?.assignDetails?.assignedTo || "Unassigned"}
              />
              <InfoDate
                label="Assigned Date"
                value={asset.assignDetails?.assignedDate}
              />
            </Card>

            {employee && (
              <Card title="Employee Info">
                <Info label="Name" value={employee.name} />
                <Info label="Email" value={employee.email} />
                <Info label="Location" value={employee.location} />
                <Info label="Contact" value={employee.contact} />
              </Card>
            )}
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

            {/* Comments */}
            <Card title={`Comments`}>
             
                <div className=" p-3 mb-2 bg-green-50">
                  <Info
                    label=""
                    value={formData.assetsComments}
                    isEdit={isEdit}
                    onChange={(v) =>
                      setFormData((prev) => ({ ...prev, assetsComments: v }))
                    }
                  />
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
  <div className="bg-white p-5 rounded-xl shadow">
    <h2 className="text-lg font-semibold mb-4 text-indigo-600">{title}</h2>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-2 gap-4 text-sm">{children}</div>
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
      <p className="font-medium">{value || "N/A"}</p>
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
        <p className="font-medium">{value || "N/A"}</p>
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
          {value ? new Date(value).toLocaleDateString() : "N/A"}
        </p>
      )}
    </div>
  );
};
