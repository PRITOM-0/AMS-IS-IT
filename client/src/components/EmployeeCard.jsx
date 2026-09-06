import { useNavigate } from "react-router-dom";
import {
  User,
  Hash,
  Building2,
  MapPin,
  Briefcase,
  Layers,
} from "lucide-react";

const EmployeeCard = ({ employee }) => {
  const navigate = useNavigate();

  return (
    <tr
      onClick={() => navigate(`/employees/${employee.id}`)}
      className="border-b border-indigo-200 bg-gradient-to-r from-indigo-100 via-white to-violet-100 hover:shadow-sm hover:brightness-[0.98] transition-all duration-200 cursor-pointer"
    >
      {/* EMPLOYEE NAME & ID */}
      <td className="px-4 py-3 border-r border-indigo-100/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
            <User size={20} />
          </div>
          <div className="min-w-0">
            <span className="block font-semibold text-indigo-700 truncate">
              {employee.employeeName || "Unnamed Employee"}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <Hash size={13} />
              <span>{employee.employeeId || "N/A"}</span>
            </div>
          </div>
        </div>
      </td>

      {/* DESIGNATION */}
      <td className="px-4 py-3 text-sm border-r border-indigo-100/50">
        <div className="flex items-center gap-1.5 text-gray-800 font-medium">
          <Briefcase size={15} className="text-indigo-500 shrink-0" />
          <span className="truncate">{employee.designation || "N/A"}</span>
        </div>
      </td>

      {/* COMPANY */}
      <td className="px-4 py-3 text-sm border-r border-indigo-100/50">
        <div className="flex items-center gap-1.5 text-gray-800">
          <Building2 size={15} className="text-indigo-500 shrink-0" />
          <span className="truncate">{employee.company || "N/A"}</span>
        </div>
      </td>

      {/* LOCATION */}
      <td className="px-4 py-3 text-sm border-r border-indigo-100/50">
        <div className="flex items-center gap-1.5 text-gray-800">
          <MapPin size={15} className="text-indigo-500 shrink-0" />
          <span className="truncate">{employee.location || "N/A"}</span>
        </div>
      </td>

      {/* DEPARTMENT */}
      <td className="px-4 py-3 text-sm border-r border-indigo-100/50">
        <div className="flex items-center gap-1.5 text-gray-800">
          <Layers size={15} className="text-indigo-500 shrink-0" />
          <span className="truncate">{employee.department || "N/A"}</span>
        </div>
      </td>

      {/* ASSET COUNT */}
      <td className="px-4 py-3 text-right">
        <span className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-md whitespace-nowrap font-medium inline-block">
          {employee.assetlist?.length || 0} Assets
        </span>
      </td>
    </tr>
  );
};

export default EmployeeCard;