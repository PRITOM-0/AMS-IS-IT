import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../env";
import TaskCard from "../components/TaskCard";
import { Plus, Search } from "lucide-react";

export default function Task() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch(`${API_BASE_URL}/tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Failed to load tasks:", err));
  }, []);

  const filteredTasks = tasks
  .filter((t) => {
    const q = search.toLowerCase(); // Convert search input string to lowercase

    const matchSearch =
      t.taskName?.toLowerCase().includes(q) ||
      t.taskCode?.toLowerCase().includes(q) ||
      t.assetCode?.toLowerCase().includes(q) ||
      t.username?.toLowerCase().includes(q) ||
      t.itPersonName?.toLowerCase().includes(q);

    const matchFilter = filter === "All" || t.progress === filter;

    return matchSearch && matchFilter;
  })
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort filtered items (Newest first)

  const tabs = ["All", "Arrived", "On Process", "Complete"];

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Task Management</h1>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex items-center border px-3 py-2 rounded-xl w-full md:w-72 bg-white shadow-sm">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              placeholder="Search tasks..."
              className="w-full outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => navigate("/tasks/add")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            <Plus size={18} /> Create Task
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              filter === t ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => <TaskCard key={task.id || task.taskId} task={task} />)
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500 border rounded-xl bg-gray-50">
            No tasks found.
          </div>
        )}
      </div>
    </div>
  );
}