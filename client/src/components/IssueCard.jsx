import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  X,
  Cpu,
  User,
} from "lucide-react";

const statusStyles = {
  Open: "bg-red-100 text-red-600",
  Solving: "bg-yellow-100 text-yellow-700",
  Resolved: "bg-green-100 text-green-600",
  Death: "bg-gray-200 text-gray-600",
};

const statusIcons = {
  Open: <AlertTriangle size={14} />,
  Solving: <Clock size={14} />,
  Resolved: <CheckCircle size={14} />,
  Death: <X size={14} />,
};

const priorityStyles = {
  High: "text-red-600",
  Medium: "text-yellow-600",
  Low: "text-green-600",
};

export default function IssueCard({ issue, asset, employee }) {

  return (
    <Link
      to={`/issues/${issue.id}`}
      className="block bg-white rounded-xl shadow-sm border hover:shadow-lg hover:-translate-y-1 transition p-5 space-y-4"
    >
      {/* TOP ROW */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-semibold text-lg">{issue.id}</h2>
          <p className="text-sm font-bold text-gray-500 line-clamp-2">
            {issue.description}
          </p>
        </div>

        <span
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyles[issue.status]}`}
        >
          {statusIcons[issue.status]}
          {issue.status}
        </span>
      </div>

      {/* PRIORITY + TYPE */}
      <div className="flex justify-between text-sm">
        <span className={`font-medium ${priorityStyles[issue.priority]}`}>
          {issue.priority} Priority
        </span>

        <span className="text-gray-500">
          {issue.issueType}
        </span>
      </div>

      {/* ASSET */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Cpu size={14} className="text-gray-400" />
        <span>{asset?.name || "Unknown Asset"}</span>
      </div>

      {/* PEOPLE */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <div>
            <p className="text-gray-500 text-xs">Reported</p>
            <p className="font-medium">
              {employee?.name || "Unassigned"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <div>
            <p className="text-gray-500 text-xs">Assigned</p>
            <p className="font-medium">
              {employee?.name || "Unassigned"}
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t">
        <span>📅 {issue.createdAt}</span>

        {issue.resolvedAt ? (
          <span className="text-green-500">
            ✔ Resolved
          </span>
        ) : (
          <span className="text-yellow-500">
            ⏳ Ongoing
          </span>
        )}
      </div>
    </Link>
  );
}