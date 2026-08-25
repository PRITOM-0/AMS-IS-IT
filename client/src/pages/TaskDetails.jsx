import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../env";
import AssetCard from "../components/AssetCard";
import { ArrowLeft } from "lucide-react";
import {
  Pencil,
  Save,
  X,
  Cpu,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import EmployeeCard from "../components/EmployeeCard";

const statusStyles = {
  Open: "bg-red-100 text-red-600 border-red-200",
  Solving: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Resolved: "bg-green-100 text-green-600 border-green-200",
  Death: "bg-gray-200 text-gray-600 border-gray-300",
};

const priorityStyles = {
  High: "text-red-600",
  Medium: "text-yellow-600",
  Low: "text-green-600",
};

const statusIcons = {
  Open: <AlertTriangle size={16} />,
  Solving: <Clock size={16} />,
  Resolved: <CheckCircle size={16} />,
  Death: <X size={16} />,
};

export default function TaskDetails() {
  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [asset, setAsset] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({});
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // fetch task
    fetch(`${API_BASE_URL}/tasks/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTask(data);
        setForm(data);

        // fetch asset
        fetch(`${API_BASE_URL}/assets/${data.assetId}`)
          .then((res) => res.json())
          .then(setAsset);
      });

    // fetch employees
    fetch(`${API_BASE_URL}/employees`)
      .then((res) => res.json())
      .then(setEmployees);
  }, [id]);



  const handleUpdate = async () => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

  
    const updated = await res.json();
    setTask(updated);
    setEditMode(false);
  };
const formattedDate = (date) => {
      return new Date(date).toLocaleString(undefined, {
        weekday: "long", // e.g., "Monday"
        month: "short", // e.g., "Aug"
        day: "numeric", // e.g., "10"
        hour: "numeric", // e.g., "2"
        minute: "numeric", // e.g., "30"
        hour12: true, // use 12-hour time
      });
    };
  if (!task) return <p className="p-6">Loading...</p>;

  const getEmployee = (name) => {
    return employees.find((emp) => emp.name === name);
  }
  const assignedEmp = getEmployee(task.assignedTo);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* HEADER */}
      <div className=" flex justify-between items-center justify-items-center ">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-blue-600 inline-flex hover:text-blue-800 transition"
        >
          <ArrowLeft size={24} /> Back
        </button>
        <h1 className="text-2xl font-bold">
          <span className="text-gray-500">Task on - </span>{" "}
          {asset?.name || "Asset Details"}
        </h1>

        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            <Pencil size={16} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              <Save size={16} /> Save
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setForm(task);
              }}
              className="flex items-center gap-2 bg-gray-400 text-white px-4 py-2 rounded-lg"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* STATUS BAR */}
      <div className="flex items-center gap-4">
        <span
          className={`flex items-center gap-2 px-3 py-1 border rounded-full text-sm font-medium ${
            statusStyles[task.status]
          }`}
        >
          {statusIcons[task.status]} {task.status}
        </span>

        <span className={`font-semibold ${priorityStyles[task.priority]}`}>
          {task.priority} Priority
        </span>

        <span className="text-gray-500 text-sm">Type: {task.taskType}</span>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-4 gap-6">
        {/* LEFT - Task INFO */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow space-y-4 border">
          <h2 className="font-semibold text-lg">Task Details</h2>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-500">Description</label>
            {editMode ? (
              <textarea
                className="w-full mt-1 p-2 border rounded-lg"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            ) : (
              <p className="mt-1">{task.description}</p>
            )}
          </div>
          {/* Priority + Status Edit (Same Row) */}
          {editMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="text-sm text-gray-500">Priority</label>
                <select
                  className="w-full mt-1 p-2 border rounded-lg"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <select
                  className="w-full mt-1 p-2 border rounded-lg"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Open</option>
                  <option>Solving</option>
                  <option>Resolved</option>
                  <option>Death</option>
                </select>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Timeline</h3>
            <div className="text-sm text-black font-bold space-y-1">
              <p>📅 Created: {formattedDate(task.createdAt)}</p>
              <p>
                ✅ Resolved:{" "}
                {task.resolvedAt
                  ? formattedDate(task.resolvedAt)
                  : "Not resolved yet"}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className=" col-span-2">
          {/* ASSET CARD */}
          <p className="font-medium text-lg p-2 text-right">
            Asset Information
          </p>
          {asset && <AssetCard asset={asset} />}

          {/* PEOPLE CARD */}
          <p className="font-medium text-lg p-2 text-right">
            Employee Information
          </p>
          {asset && <EmployeeCard employee={assignedEmp} />}
        </div>
      </div>
    </div>
  );
}
