import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../env";
import { ArrowLeft } from "lucide-react";

const initialForm = {
  taskId: "",
  taskCode: "",
  taskName: "",
  createdAt: "",
  updatedAt: "",
  assetId: "",
  assetName: "",
  assetCode: "",
  equipment: "",
  username: "",
  company: "",
  location: "",
  complainMode: "Phone",
  complainDate: "",
  itPersonName: "",
  progress: "Arrived",
  priority: "Medium",
  taskStartDate: "",
  taskCompleteDate: "",
  taskFinishingDate: "",
  days: 0,
  timeDuration: "0 hours",
  reasonForDelay: "",
  mainCategory: "",
  subCategory: "",
  issueSummary: "",
  stepInDetails: "",
};

export default function AddTask() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [assets, setAssets] = useState([]);
  const [tasksCount, setTasksCount] = useState(0);

  const [assetQuery, setAssetQuery] = useState("");
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/assets`)
      .then((res) => res.json())
      .then((data) => setAssets(data))
      .catch((err) => console.error("Error loading assets:", err));

    fetch(`${API_BASE_URL}/tasks`)
      .then((res) => res.json())
      .then((data) => setTasksCount(data.length))
      .catch((err) => console.error("Error loading tasks count:", err));
  }, []);

  const calculateDuration = (start, finish) => {
    if (!start || !finish) return { days: 0, timeDuration: "0 hours" };
    const diffTime = Math.max(0, new Date(finish) - new Date(start));
    return {
      days: Math.floor(diffTime / (1000 * 60 * 60 * 24)),
      timeDuration: `${Math.round(diffTime / (1000 * 60 * 60))} hours`,
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if (name === "taskStartDate" || name === "taskFinishingDate") {
      const start = name === "taskStartDate" ? value : form.taskStartDate;
      const finish = name === "taskFinishingDate" ? value : form.taskFinishingDate;
      updatedForm = { ...updatedForm, ...calculateDuration(start, finish) };
    }
    setForm(updatedForm);
  };

  // Filter Assets matching assetCode, equipment, userName, or location
  const filteredAssets = assets.filter((a) => {
    const q = assetQuery.toLowerCase();
    return (
      a.assetCode?.toLowerCase().includes(q) ||
      a.equipment?.toLowerCase().includes(q) ||
      a.userName?.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q)
    );
  });

  const handleSelectAsset = (a) => {
    const nowIso = new Date().toISOString().slice(0, 16);
    setForm({
      ...form,
      assetId: a.id || "",
      assetCode: a.assetCode || "",
      assetName: a.equipment || "",
      equipment: a.equipment || "",
      username: a.userName || "Unassigned",
      company: a.department || "",
      location: a.location || "",
      complainDate: form.complainDate || nowIso,
    });

    setAssetQuery(
      `${a.assetCode} - ${a.equipment} - User: ${a.userName || "Unassigned"} - Loc: ${a.location || "N/A"}`
    );
    setShowAssetDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assetId || !form.taskName || !form.issueSummary) {
      alert("Please select an Asset, fill in Task Name, and provide an Issue Summary.");
      return;
    }

    const now = new Date().toISOString();
    const generatedId = "TSK-" + Date.now();
    const generatedTaskCode = "" + (100000 + (tasksCount + 1));

    const payload = {
      ...form,
      taskId: generatedId,
      id: generatedId,
      taskCode: form.taskCode || generatedTaskCode,
      createdAt: now,
      updatedAt: now,
      complainDate: form.complainDate || now,
    };

    await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    navigate("/tasks");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate("/tasks")}
        className="flex items-center gap-2 text-gray-600 hover:text-black font-medium"
      >
        <ArrowLeft size={18} /> Back to Tasks
      </button>

      <form
        onSubmit={handleSubmit}
        className="border-emerald-400  text-black bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 rounded-xl shadow space-y-5 border"
      >
        <h2 className="font-semibold text-xl border-b pb-2">Create New Task</h2>

        {/* ASSET SELECTOR WITH DROPDOWN */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative col-span-2">
            <label className="text-sm font-medium">Select Asset *</label>
            <input
              value={assetQuery}
              onChange={(e) => {
                setAssetQuery(e.target.value);
                setShowAssetDropdown(true);
              }}
              placeholder="Search by Code, Equipment, User, or Location..."
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
            />

            {showAssetDropdown && assetQuery && (
              <div className="absolute bg-white z-20 border w-full rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => handleSelectAsset(a)}
                      className="p-2.5 hover:bg-emerald-50 cursor-pointer border-b text-sm flex flex-col gap-0.5"
                    >
                      <div className="font-semibold text-gray-900">
                        {a.assetCode} - {a.equipment}
                      </div>
                      <div className="text-xs text-gray-500">
                        User: <span className="text-gray-700">{a.userName || "N/A"}</span> | Location:{" "}
                        <span className="text-gray-700">{a.location || "N/A"}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-gray-500">No matching assets found</div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Task Name *</label>
            <input
              name="taskName"
              value={form.taskName}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Username (Auto)</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-gray-50 mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Department / Company (Auto)</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-gray-50 mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Location (Editable)</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
            />
          </div>
        </div>

        {/* COMPLAINT DETAILS */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Complain Mode</label>
            <select
              name="complainMode"
              value={form.complainMode}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
            >
              <option value="Phone">Phone</option>
              <option value="Whatsapp">Whatsapp</option>
              <option value="Mail">Mail</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Complain Date</label>
            <input
              type="datetime-local"
              name="complainDate"
              value={form.complainDate}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">IT Person Name</label>
            <input
              name="itPersonName"
              value={form.itPersonName}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
            />
          </div>
        </div>

        {/* STATUS & CATEGORIES */}
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Progress</label>
            <select
              name="progress"
              value={form.progress}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
            >
              <option value="Arrived">Arrived</option>
              <option value="On Process">On Process</option>
              <option value="Complete">Complete</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Main Category</label>
            <input
              name="mainCategory"
              value={form.mainCategory}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Sub Category</label>
            <select
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
            >
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Networking">Networking</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* DURATION & REASON */}
        <div className="grid md:grid-cols-3 gap-4 bg-white/60 p-4 rounded-lg border">
          <div>
            <label className="text-sm font-medium">Task Start Date</label>
            <input
              type="datetime-local"
              name="taskStartDate"
              value={form.taskStartDate}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Task Complete Date</label>
            <input
              type="datetime-local"
              name="taskCompleteDate"
              value={form.taskCompleteDate}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Task Finishing Date</label>
            <input
              type="datetime-local"
              name="taskFinishingDate"
              value={form.taskFinishingDate}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Days (Auto)</label>
            <input
              readOnly
              value={form.days}
              className="w-full border px-3 py-2 rounded-lg bg-gray-100 mt-1 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Time Duration (Auto)</label>
            <input
              readOnly
              value={form.timeDuration}
              className="w-full border px-3 py-2 rounded-lg bg-gray-100 mt-1 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Reason for Delay</label>
            <input
              name="reasonForDelay"
              value={form.reasonForDelay}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Issue Summary *</label>
            <input
              name="issueSummary"
              value={form.issueSummary}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Steps in Detail</label>
            <textarea
              name="stepInDetails"
              value={form.stepInDetails}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-white mt-1 h-24"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-emerald-700"
          >
            Save Task
          </button>
          <button
            type="button"
            onClick={() => setForm(initialForm)}
            className="bg-gray-400 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-500"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}