import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "../env";

function EmployeeDetails() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [originalEmployee, setOriginalEmployee] = useState(null);
  const [formData, setFormData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [empRes, assetRes] = await Promise.all([
          fetch(`${API_BASE_URL}/employees/${id}`),
          fetch(`${API_BASE_URL}/assets`),
        ]);

        const empData = await empRes.json();
        const assetData = await assetRes.json();

        setEmployee(empData);
        setOriginalEmployee(empData);
        setFormData(empData ? { ...empData } : null);
        setAssets(assetData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getAsset = (assetId) => {
    return assets.find((a) => a.id === assetId);
  };

  const handleEdit = () => {
    if (employee) {
      setFormData({ ...employee });
      setIsEdit(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleUpdate = async () => {
    if (!formData) return;
    formData.updatedAt = new Date().toISOString(); // Update the updatedAt timestamp

    try {
      const payload = {
        ...formData,
        assetlist: employee?.assetlist || [],
        assethistory: employee?.assethistory || [],
      };

      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update employee");

      const updatedEmployee = await response.json();
      setEmployee(updatedEmployee);
      setOriginalEmployee(updatedEmployee);
      setFormData({ ...updatedEmployee });
      setIsEdit(false);
    } catch (err) {
      console.error("Error updating employee:", err);
      alert("Failed to update employee");
    }
  };

  const handleReset = () => {
    if (originalEmployee) {
      setFormData({ ...originalEmployee });
    }
    setIsEdit(false);
  };

  if (loading) {
    return <div className="p-6">Loading employee...</div>;
  }

  if (!employee) {
    return <div className="p-6 text-red-500">Employee not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft size={20} /> Back
        </button>

        {!isEdit ? (
          <button
            onClick={handleEdit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Update
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border shadow-lg rounded-2xl p-6 space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{employee?.name}</h1>
              <p className="text-sm text-blue-100">{employee?.email}</p>
            </div>

            <div className="ml-4">
              <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-medium">
                {employee?.employeeCode}
              </span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {isEdit ? (
            <>
              <EditableField
                label="Name"
                name="name"
                value={formData?.name || ""}
                onChange={handleChange}
              />
              <EditableField
                label="Employee Code"
                name="employeeCode"
                value={formData?.employeeCode || ""}
                onChange={handleChange}
              />
              <EditableField
                label="Email"
                name="email"
                value={formData?.email || ""}
                onChange={handleChange}
                type="email"
              />
              <EditableField
                label="Contact"
                name="contact"
                value={formData?.contact || ""}
                onChange={handleChange}
              />
              <EditableField
                label="Designation"
                name="designation"
                value={formData?.designation || ""}
                onChange={handleChange}
              />
              <EditableField
                label="Floor"
                name="floor"
                value={formData?.floor || ""}
                onChange={handleChange}
              />
              <EditableField
                label="Location"
                name="location"
                value={formData?.location || ""}
                onChange={handleChange}
                className="sm:col-span-2 md:col-span-2"
              />
            </>
          ) : (
            <>
              <InfoCard label="Employee Code" value={employee?.employeeCode} />
              <InfoCard label="Location" value={employee?.location} />
              <InfoCard label="Contact" value={employee?.contact} />
              <InfoCard label="Designation" value={employee?.designation} />
              <InfoCard label="Floor" value={employee?.floor} />
            </>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold mb-3 text-lg">Assigned Assets</h2>

        {!employee.assetlist || employee.assetlist.length === 0 ? (
          <div className="text-gray-500 text-sm bg-gray-50 border rounded-lg p-4 text-center">
            No assets assigned
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-3">
            {employee.assetlist.map((assetId) => {
              const asset = getAsset(assetId);

              return (
                <Link
                  to={`/assets/${assetId}`}
                  key={assetId}
                  className="border rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition flex justify-between items-center bg-white"
                >
                  <div>
                    <p className="font-semibold text-blue-600">
                      {asset ? asset.name : assetId}
                    </p>

                    <p className="text-xs text-gray-500">
                      Code: {asset?.assetCode || "N/A"}
                    </p>

                    <p className="text-xs text-gray-400">
                      {asset?.category || "General"}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Assigned
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="font-semibold mb-3 text-lg">Asset History</h2>

        {!employee.assethistory || employee.assethistory.length === 0 ? (
          <div className="text-gray-500 text-sm bg-gray-50 border rounded-lg p-4 text-center">
            No asset history available
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employee.assethistory.map((entry) => {
              const asset = getAsset(entry.assetId);

              return (
                <Link
                  to={`/assets/${entry.assetId}`}
                  key={entry.assetId}
                  className="block border rounded-xl p-4 shadow-sm bg-white hover:shadow-md hover:scale-[1.02] transition"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold text-blue-600">
                        {asset ? asset.name : entry.assetId}
                      </p>
                      <p className="text-xs text-gray-500">
                        Code: {asset?.assetCode || "N/A"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {entry?.issue || "Asset"}
                      </span>

                      <span
                        className={`text-xs px-2 py-1 rounded ${entry.returnedDate ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}
                      >
                        {entry.returnedDate ? "Returned" : "In Use"}
                      </span>
                    </div>
                  </div>

                  <div className="my-3 border-t"></div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Assigned:</span>{" "}
                      {entry.assignedDate}
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

function InfoCard({ label, value }) {
  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-gray-50">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800 mt-1">{value || "N/A"}</p>
    </div>
  );
}

function EditableField({
  label,
  name,
  value,
  onChange,
  type = "text",
  className = "",
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm text-gray-700 ${className}`}>
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </label>
  );
}
