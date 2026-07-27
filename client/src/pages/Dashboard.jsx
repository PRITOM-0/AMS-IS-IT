import React from "react";
import assetsData from "../data/assetsData";
import usersData from "../data/usersData";

function Dashboard() {
  const totalAssets = assetsData.length;
  const availableAssets = assetsData.filter(
    (a) => a.status === "Available"
  ).length;
  const inUseAssets = assetsData.filter(
    (a) => a.status === "In Use"
  ).length;
  const totalUsers = usersData.length;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome to AMS IS IT 👋
        </h1>
        <p className="text-gray-500">
          Here’s a quick overview of your system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500 text-sm">Total Assets</h3>
          <p className="text-2xl font-bold text-blue-600">
            {totalAssets}
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500 text-sm">Available</h3>
          <p className="text-2xl font-bold text-green-600">
            {availableAssets}
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500 text-sm">In Use</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {inUseAssets}
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500 text-sm">Total Users</h3>
          <p className="text-2xl font-bold text-purple-600">
            {totalUsers}
          </p>
        </div>
      </div>

      {/* Recent Assets */}
      <div className="bg-white shadow rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Assets
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-sm border-b">
                <th className="py-2">Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {assetsData.slice(0, 5).map((asset) => (
                <tr
                  key={asset.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-2">{asset.name}</td>
                  <td>{asset.category}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        asset.status === "Available"
                          ? "bg-green-100 text-green-700"
                          : asset.status === "In Use"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td>{asset.assignedTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;