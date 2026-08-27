import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../env";
import {
  ArrowLeft,
  Edit3,
  Save,
  RotateCcw,
  Trash2,
  Loader2,
  Cpu,
  User,
  Clock,
  Wrench,
  FileText,
} from "lucide-react";

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [originalData, setOriginalData] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/tasks/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOriginalData(data);
        setForm(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch task:", err);
        setLoading(false);
      });
  }, [id]);


  

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
      const finish =
        name === "taskFinishingDate" ? value : form.taskFinishingDate;
      updatedForm = { ...updatedForm, ...calculateDuration(start, finish) };
    }
    setForm(updatedForm);
  };

  const handleReset = () => {
    setForm({ ...originalData });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setOriginalData(updated);
        setForm(updated);
        setIsEditMode(false);
      } else {
        throw new Error("Failed to update");
      }
    } catch (err) {
      console.error("Failed to update task:", err);
      alert("Error updating task.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this task? This cannot be undone.",
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        navigate("/tasks");
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task.");
      setDeleting(false);
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border-red-300";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-300";
      default:
        return "bg-slate-100 text-slate-700 border-indigo-300";
    }
  };

  const getProgressStyle = (progress) => {
    switch (progress) {
      case "Complete":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "On Process":
        return "bg-blue-50 text-blue-700 border-blue-300";
      default:
        return "bg-amber-50 text-amber-700 border-amber-300";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-6 text-center text-slate-500">Task not found.</div>
    );
  }
 

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-800">
      {/* NAVIGATION & ACTION HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-xl border border-indigo-300 shadow-md">
        <button
          onClick={() => navigate("/tasks")}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-950 font-semibold transition"
        >
          <ArrowLeft size={18} /> Back to Tasks
        </button>

        <div className="flex items-center gap-3">
          {isEditMode ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-indigo-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-300 transition"
              >
                <RotateCcw size={16} /> Reset
              </button>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md transition disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                Update Task
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 shadow-md transition"
              >
                <Edit3 size={16} /> Edit
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 shadow-sm transition disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Trash2 size={16} />
                )}
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* MAIN FORM */}
      <form onSubmit={handleUpdate} className="space-y-4">
        {/* TWO CARDS IN ONE ROW CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HERO TITLE CARD */}
          <div className="bg-white border border-slate-400 rounded-xl p-6 shadow-lg flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between border-b border-indigo-300 pb-2">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-indigo-300 px-3 py-1 rounded-md shadow-xs">
                #{form.taskCode || "TSK-000"}
              </span>

              <div className="flex items-center gap-2">
                {isEditMode ? (
                  <>
                    <select
                      name="priority"
                      value={form.priority || "Medium"}
                      onChange={handleChange}
                      className="border border-indigo-300 text-xs px-3 py-1.5 rounded-lg bg-white font-medium focus:border-blue-500 outline-none"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>

                    <select
                      name="progress"
                      value={form.progress || "Arrived"}
                      onChange={handleChange}
                      className="border border-indigo-300 text-xs px-3 py-1.5 rounded-lg bg-white font-medium focus:border-blue-500 outline-none"
                    >
                      <option value="Arrived">Arrived</option>
                      <option value="On Process">On Process</option>
                      <option value="Complete">Complete</option>
                    </select>
                  </>
                ) : (
                  <>
                    <span
                      className={`text-xs px-3 py-1 rounded-full border font-bold shadow-xs ${getPriorityStyle(
                        form.priority,
                      )}`}
                    >
                      {form.priority || "Medium"} Priority
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full border font-bold shadow-xs ${getProgressStyle(
                        form.progress,
                      )}`}
                    >
                      {form.progress || "Arrived"}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Task Name
              </label>
              {isEditMode ? (
                <input
                  name="taskName"
                  value={form.taskName || ""}
                  onChange={handleChange}
                  className="w-full border border-indigo-300 px-3 py-2 rounded-lg mt-1 font-bold text-lg text-slate-900 bg-white focus:border-blue-600 outline-none shadow-xs"
                />
              ) : (
               
                  <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                    {form.taskName || "Untitled Task"}
                  </h1>
                 
              )}
            </div>
          </div>

          {/* COMPLAINT CARD */}
          <div className="bg-white border border-indigo-300 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-indigo-300 pb-3">
              <FileText size={18} className="text-blue-600" /> Complaint Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">
                  Complain Mode
                </span>
                {isEditMode ? (
                  <select
                    name="complainMode"
                    value={form.complainMode || "Phone"}
                    onChange={handleChange}
                    className="w-full border border-indigo-300 px-2.5 py-1.5 rounded-lg mt-1 bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="Phone">Phone</option>
                    <option value="Whatsapp">Whatsapp</option>
                    <option value="Mail">Mail</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <span className="font-semibold text-slate-800">
                    {form.complainMode || "Phone"}
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block">
                  Complain Date
                </span>
                {isEditMode ? (
                  <input
                    type="datetime-local"
                    name="complainDate"
                    value={form.complainDate || ""}
                    onChange={handleChange}
                    className="w-full border border-indigo-300 px-2.5 py-1.5 rounded-lg mt-1 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <span className="font-semibold text-slate-800">
                    {form.complainDate
                      ? new Date(form.complainDate).toLocaleString()
                      : "N/A"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* SECTION GRID: ASSET & USER INFO */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* ASSET CARD */}
          <div className="bg-white border border-indigo-300 rounded-xl p-5 shadow-md space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-indigo-300 pb-3">
              <Cpu size={18} className="text-blue-600" /> Asset & Hardware Info
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">
                  Asset Code (Fixed)
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {form.assetCode || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block">
                  Equipment (Fixed)
                </span>
                <span className="font-semibold text-slate-800">
                  {form.equipment || form.assetName || "N/A"}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t-2 border-slate-100">
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  Main & Sub Category
                </span>
                {isEditMode ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      name="mainCategory"
                      value={form.mainCategory || ""}
                      onChange={handleChange}
                      placeholder="Main Category"
                      className="border border-indigo-300 px-2.5 py-1.5 rounded-lg text-sm focus:border-blue-500 outline-none"
                    />
                    <select
                      name="subCategory"
                      value={form.subCategory || "Hardware"}
                      onChange={handleChange}
                      className="border border-indigo-300 px-2.5 py-1.5 rounded-lg text-sm bg-white focus:border-blue-500 outline-none"
                    >
                      <option value="Hardware">Hardware</option>
                      <option value="Software">Software</option>
                      <option value="Networking">Networking</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-xs font-bold border border-indigo-300">
                      {form.mainCategory || "General"}
                    </span>
                    <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-200">
                      {form.subCategory || "Hardware"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* USER CARD */}
          <div className="bg-white border border-indigo-300 rounded-xl p-5 shadow-md space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-indigo-300 pb-3">
              <User size={18} className="text-blue-600" /> Assignment & Location
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">
                  Username
                </span>
                {isEditMode ? (
                  <input
                    name="username"
                    value={form.username || ""}
                    onChange={handleChange}
                    className="w-full border border-indigo-300 px-2.5 py-1.5 rounded-lg mt-1 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <span className="font-semibold text-slate-800">
                    {form.username || "N/A"}
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block">
                  Department / Company
                </span>
                {isEditMode ? (
                  <input
                    name="company"
                    value={form.company || ""}
                    onChange={handleChange}
                    className="w-full border border-indigo-300 px-2.5 py-1.5 rounded-lg mt-1 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <span className="font-semibold text-slate-800">
                    {form.company || "N/A"}
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block">
                  Location
                </span>
                {isEditMode ? (
                  <input
                    name="location"
                    value={form.location || ""}
                    onChange={handleChange}
                    className="w-full border border-indigo-300 px-2.5 py-1.5 rounded-lg mt-1 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <span className="font-semibold text-slate-800">
                    {form.location || "N/A"}
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block">
                  IT Technician
                </span>
                {isEditMode ? (
                  <input
                    name="itPersonName"
                    value={form.itPersonName || ""}
                    onChange={handleChange}
                    className="w-full border border-indigo-300 px-2.5 py-1.5 rounded-lg mt-1 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <span className="font-semibold text-slate-800">
                    {form.itPersonName || "Unassigned"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* TECHNICAL DETAILS CARD */}
        <div className="bg-white border border-indigo-300 rounded-xl p-5 shadow-md space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-indigo-300 pb-3">
            <Wrench size={18} className="text-blue-600" /> Technical Details
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                Issue Summary
              </span>
              {isEditMode ? (
                <input
                  name="issueSummary"
                  value={form.issueSummary || ""}
                  onChange={handleChange}
                  className="w-full border border-indigo-300 px-3 py-2 rounded-lg bg-white focus:border-blue-600 outline-none text-sm font-medium"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-lg border border-indigo-300 shadow-xs">
                  {form.issueSummary || "No summary recorded."}
                </p>
              )}
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                Steps & Resolution Log
              </span>
              {isEditMode ? (
                <textarea
                  name="stepInDetails"
                  value={form.stepInDetails || ""}
                  onChange={handleChange}
                  className="w-full border border-indigo-300 px-3 py-2 rounded-lg h-32 bg-white focus:border-blue-600 outline-none text-sm font-medium"
                />
              ) : (
                <div className="text-sm font-medium text-slate-800 bg-slate-50 p-4 rounded-lg border border-indigo-300 shadow-xs whitespace-pre-wrap leading-relaxed min-h-[5rem]">
                  {form.stepInDetails || "No detailed steps logged yet."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TIMELINE CARD */}
        <div className="bg-slate-50 border border-slate-400 rounded-xl p-5 shadow-md space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-indigo-300 pb-3">
            <Clock size={18} className="text-blue-600" /> Timeline & Duration
            Track
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Start Date
              </span>
              {isEditMode ? (
                <input
                  type="datetime-local"
                  name="taskStartDate"
                  value={form.taskStartDate || ""}
                  onChange={handleChange}
                  className="w-full border border-indigo-300 px-2.5 py-1.5 rounded-lg mt-1 bg-white focus:border-blue-500 outline-none"
                />
              ) : (
                <span className="font-semibold text-slate-800">
                  {form.taskStartDate
                    ? new Date(form.taskStartDate).toLocaleString()
                    : "N/A"}
                </span>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Complete Date
              </span>
              {isEditMode ? (
                <input
                  type="datetime-local"
                  name="taskCompleteDate"
                  value={form.taskCompleteDate || ""}
                  onChange={handleChange}
                  className="w-full border border-indigo-300 px-2.5 py-1.5 rounded-lg mt-1 bg-white focus:border-blue-500 outline-none"
                />
              ) : (
                <span className="font-semibold text-slate-800">
                  {form.taskCompleteDate
                    ? new Date(form.taskCompleteDate).toLocaleString()
                    : "N/A"}
                </span>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Finishing Date
              </span>
              {isEditMode ? (
                <input
                  type="datetime-local"
                  name="taskFinishingDate"
                  value={form.taskFinishingDate || ""}
                  onChange={handleChange}
                  className="w-full border border-indigo-300 px-2.5 py-1.5 rounded-lg mt-1 bg-white focus:border-blue-500 outline-none"
                />
              ) : (
                <span className="font-semibold text-slate-800">
                  {form.taskFinishingDate
                    ? new Date(form.taskFinishingDate).toLocaleString()
                    : "N/A"}
                </span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-sm pt-3 border-t-2 border-indigo-300">
            <div className="bg-white p-3 rounded-lg border border-indigo-300 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">
                Total Days
              </span>
              <span className="font-black text-slate-900 text-base">
                {form.days || 0} Days
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-indigo-300 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">
                Total Duration
              </span>
              <span className="font-black text-slate-900 text-base">
                {form.timeDuration || "0 hours"}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-indigo-300 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">
                Reason for Delay
              </span>
              {isEditMode ? (
                <input
                  name="reasonForDelay"
                  value={form.reasonForDelay || ""}
                  onChange={handleChange}
                  className="w-full border border-indigo-300 px-2 py-1 rounded text-xs mt-1 focus:border-blue-500 outline-none"
                />
              ) : (
                <span className="font-bold text-slate-800 text-xs">
                  {form.reasonForDelay || "None"}
                </span>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
