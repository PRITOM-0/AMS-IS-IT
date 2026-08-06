import { Link } from "react-router-dom";

const EmployeeCard = ({ employee }) => {
  return (
    <Link to={`/employees/${employee.id}`} className="block">
      <div className="border rounded-xl shadow-sm p-4 hover:shadow-md transition duration-200 border-indigo-200 text-indigo-700 bg-gradient-to-br from-indigo-100 via-white to-violet-100 flex justify-between items-center">

        {/* LEFT SECTION */}
        <div>
          <h2 className="text-lg font-semibold text-blue-600">
            {employee.name}
          </h2>
          <p className="text-sm text-gray-500">{employee.email}</p>

          <div className="mt-2 text-sm text-gray-700 flex flex-wrap gap-x-4">
            <p><strong>ID:</strong> {employee.employeeid}</p>
            <p><strong>Location:</strong> {employee.location}</p>
            <p><strong>Floor:</strong> {employee.floor}</p>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="text-right flex flex-col items-end gap-2">
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
            {employee.designation}
          </span>

          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {employee.assetlist?.length || 0} Assets
          </span>
        </div>

      </div>
    </Link>
  );
};

export default EmployeeCard;