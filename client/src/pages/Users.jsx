import React from "react";
import usersData from "../data/usersData";

function Users() {
  const getRoleStyle = (role) => {
    return role === "Admin"
      ? "bg-purple-100 text-purple-700"
      : "bg-blue-100 text-blue-700";
  };

  const getStatusStyle = (status) => {
    return status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Users Management
      </h1>

      {/* Table */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="w-full text-left">
          {/* Header */}
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Department</th>
              <th className="p-4">Status</th>
              <th className="p-4">Join Date</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {usersData.map((user) => (
              <tr
                key={user.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-4 font-medium text-gray-800">
                  {user.name}
                </td>
                <td className="p-4 text-gray-600">{user.email}</td>

                {/* Role Badge */}
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleStyle(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="p-4 text-gray-600">
                  {user.department}
                </td>

                {/* Status Badge */}
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                      user.status
                    )}`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="p-4 text-gray-600">
                  {user.joinDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;