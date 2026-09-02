 
import { Link } from "react-router-dom";
import {
  User,
  Hash,
  Building2,
  MapPin,
  Briefcase,
  Layers,
} from "lucide-react";

const EmployeeCard = ({ employee }) => {
  return (
    <Link to={`/employees/${employee.id}`} className="block">
      <div className="border rounded-xl shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-indigo-200 bg-gradient-to-br from-indigo-100 via-white to-violet-100">

        {/* HEADER */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <User size={20} />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-indigo-700 truncate">
                {employee.employeeName || "Unnamed Employee"}
              </h2>

              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <Hash size={13} />
                <span>{employee.employeeId || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* ASSET COUNT */}
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md whitespace-nowrap">
            {employee.assetlist?.length || 0} Assets
          </span>
        </div>

        {/* EMPLOYEE DETAILS */}
        <div className="mt-4 space-y-2 text-sm">

          {/* Designation */}
          <div className="flex items-center">
            <div className="w-28 flex items-center gap-2 text-gray-500 shrink-0">
              <Briefcase size={15} className="text-indigo-500" />
              <span className="font-medium">Designation</span>
            </div>

            <span className="text-gray-800 font-medium">
              : {employee.designation || "N/A"}
            </span>
          </div>

          {/* Company */}
          <div className="flex items-center">
            <div className="w-28 flex items-center gap-2 text-gray-500 shrink-0">
              <Building2 size={15} className="text-indigo-500" />
              <span className="font-medium">Company</span>
            </div>

            <span className="text-gray-800">
              : {employee.company || "N/A"}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center">
            <div className="w-28 flex items-center gap-2 text-gray-500 shrink-0">
              <MapPin size={15} className="text-indigo-500" />
              <span className="font-medium">Location</span>
            </div>

            <span className="text-gray-800">
              : {employee.location || "N/A"}
            </span>
          </div>

          {/* Department */}
          <div className="flex items-center">
            <div className="w-28 flex items-center gap-2 text-gray-500 shrink-0">
              <Layers size={15} className="text-indigo-500" />
              <span className="font-medium">Department</span>
            </div>

            <span className="text-gray-800">
              : {employee.department || "N/A"}
            </span>
          </div>

        </div>

      </div>
    </Link>
  );
};

export default EmployeeCard;
 
