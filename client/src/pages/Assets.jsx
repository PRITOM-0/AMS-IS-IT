import React, { useState } from "react";
import assetsData from "../data/assetsData";

function Assets() {
  const [assets, setAssets] = useState(assetsData);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    status: "Available",
    assignedTo: "",
    purchaseDate: "",
  });

  // 🔍 Search Filter
  const filteredAssets = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  // 🎨 Status Style
  const getStatusStyle = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-600";
      case "In Use":
        return "bg-blue-100 text-blue-600";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // 🧩 Open Form
  const openForm = (type, asset = null) => {
    setFormType(type);
    setSelectedAsset(asset);
    setShowForm(true);

    if (asset) {
      setFormData(asset);
    } else {
      setFormData({
        name: "",
        category: "",
        status: "Available",
        assignedTo: "",
        purchaseDate: "",
      });
    }
  };

  // ❌ Close Form
  const closeForm = () => {
    setShowForm(false);
    setSelectedAsset(null);
  };

  // 📝 Handle Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (formType === "add") {
      setAssets([...assets, { ...formData, id: Date.now() }]);
    }

    if (formType === "edit") {
      setAssets(
        assets.map((a) =>
          a.id === selectedAsset.id ? { ...formData } : a
        )
      );
    }

    if (formType === "assign") {
      setAssets(
        assets.map((a) =>
          a.id === selectedAsset.id
            ? { ...a, assignedTo: formData.assignedTo, status: "In Use" }
            : a
        )
      );
    }

    if (formType === "issue") {
      setAssets(
        assets.map((a) =>
          a.id === selectedAsset.id
            ? { ...a, status: "Maintenance" }
            : a
        )
      );
    }

    closeForm();
  };

  // 🗑 Delete
  const handleDelete = (id) => {
    setAssets(assets.filter((a) => a.id !== id));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Assets</h1>
        <button
          onClick={() => openForm("add")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Asset
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search asset..."
        className="border p-2 mb-4 w-full rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Assigned</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredAssets.map((asset) => (
            <tr key={asset.id} className="border-t">
              <td className="p-3">{asset.name}</td>
              <td>{asset.category}</td>
              <td>
                <span className={`px-2 py-1 rounded ${getStatusStyle(asset.status)}`}>
                  {asset.status}
                </span>
              </td>
              <td>{asset.assignedTo || "—"}</td>
              <td>{asset.purchaseDate}</td>

              <td className="space-x-2">
                <button onClick={() => openForm("edit", asset)} className="text-blue-600">Edit</button>
                <button onClick={() => handleDelete(asset.id)} className="text-red-600">Delete</button>
                <button onClick={() => openForm("assign", asset)} className="text-green-600">Assign</button>
                <button onClick={() => openForm("issue", asset)} className="text-yellow-600">Issue</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded w-96 space-y-3"
          >
            <h2 className="text-xl font-bold capitalize">{formType} Asset</h2>

            {(formType === "add" || formType === "edit") && (
              <>
                <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="border p-2 w-full" />
                <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} className="border p-2 w-full" />
                <input name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} className="border p-2 w-full" />
              </>
            )}

            {formType === "assign" && (
              <input
                name="assignedTo"
                placeholder="Assign to user"
                value={formData.assignedTo}
                onChange={handleChange}
                className="border p-2 w-full"
              />
            )}

            <div className="flex justify-between">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Submit
              </button>

              <button
                type="button"
                onClick={closeForm}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Assets;