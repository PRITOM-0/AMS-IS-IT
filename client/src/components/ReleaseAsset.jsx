import React, { useState } from "react";
import { X, PackageCheck, Loader2, AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "../env";

const ReleaseAsset = ({ employee, asset, onReleased }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // Open Confirmation Modal
  // ==========================================

  const handleOpenModal = () => {
    setError("");
    setShowModal(true);
  };

  // ==========================================
  // Close Modal
  // ==========================================

  const handleCloseModal = () => {
    if (loading) return;

    setShowModal(false);
    setError("");
  };

  // ==========================================
  // Release Asset
  // ==========================================

  const handleRelease = async () => {
  if (!asset?.id) {
    setError("Asset information is missing.");
    return;
  }

  if (!employee?.id) {
    setError("Employee information is missing.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    // ==========================================
    // Current Assignment Information
    // ==========================================

    const employeeName = employee?.employeeName || "";

    const receivedDate = asset?.receivedDate || "";

    const releaseDate = new Date().toISOString();

    // ==========================================
    // Create Old User Object
    // ==========================================

    const oldUser = {
      employeeName,
      employeeId:employee?.employeeId || "",
      receivedDate,
      releaseDate,
    };

    // ==========================================
    // Existing Old Users
    // ==========================================

    const oldUsers = Array.isArray(asset?.oldUsers)
      ? asset.oldUsers
      : [];

    // ==========================================
    // Update Asset
    // ==========================================

    const updatedAsset = {
      ...asset,
      employeeId: "",
      receivedDate: "",
      oldUsers: [...oldUsers, oldUser],
    };

    // ==========================================
    // Update Employee Asset List
    // ==========================================

    const currentAssetList = Array.isArray(employee?.assetlist)
      ? employee.assetlist
      : [];

    const updatedAssetList = currentAssetList.filter(
      (assetId) => String(assetId) !== String(asset.id)
    
    );
    console.log("Updated Asset List:", updatedAssetList);
    console.log("Current Asset List:", currentAssetList);

    const updatedEmployee = {
      ...employee,
      assetlist: updatedAssetList,
    };

    // ==========================================
    // Update Asset
    // ==========================================

    const assetResponse = await fetch(
      `${API_BASE_URL}/assets/${asset.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAsset),
      }
    );

    if (!assetResponse.ok) {
      const responseText = await assetResponse.text();
      throw new Error(
        responseText || "Failed to release asset."
      );
    }

    // ==========================================
    // Update Employee
    // ==========================================

    const employeeResponse = await fetch(
      `${API_BASE_URL}/employees/${employee.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEmployee),
      }
    );

    if (!employeeResponse.ok) {
      const responseText = await employeeResponse.text();

      // Important:
      // Asset was already updated, but employee update failed.
      throw new Error(
        responseText || "Asset released, but employee asset list could not be updated."
      );
    }

    const savedAsset = await assetResponse.json();
    const savedEmployee = await employeeResponse.json();

    // ==========================================
    // Close Modal
    // ==========================================

    setShowModal(false);

    // ==========================================
    // Notify Parent
    // ==========================================

    if (onReleased) {
      onReleased({
        asset: savedAsset,
        employee: savedEmployee,
      });
    }
  } catch (error) {
    console.error("Release asset error:", err);

  setError(
    err instanceof Error
      ? err.message
      : "Failed to release asset."
  );
  } finally {
    setLoading(false);
  }
};

  // ==========================================
  // Component
  // ==========================================

  return (
    <>
      {/* ========================================
          Release Button
          ======================================== */}

      <button
        type="button"
        onClick={handleOpenModal}
        className="
          inline-flex
          items-center
          justify-center
          gap-2
          px-4
          py-2
          rounded-lg
          bg-red-500
          text-white
          text-sm
          font-medium
          shadow-sm
          transition-all
          duration-200
          hover:bg-red-700
          hover:shadow-md
          active:scale-95
        "
      >
        <PackageCheck size={17} />
        Release
      </button>

      {/* ========================================
          Confirmation Modal
          ======================================== */}

      {showModal && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/50
            backdrop-blur-sm
            px-4
          "
          onClick={handleCloseModal}
        >
          {/* ======================================
              Modal
              ====================================== */}

          <div
            className="
              w-full
              max-w-md
              rounded-2xl
              bg-white
              shadow-2xl
              border
              border-gray-200
              overflow-hidden
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* ====================================
                Header
                ==================================== */}

            <div
              className="
                flex
                items-center
                justify-between
                px-5
                py-4
                border-b
                border-gray-100
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    items-center
                    justify-center
                    w-10
                    h-10
                    rounded-full
                    bg-red-100
                    text-red-600
                  "
                >
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Release Asset
                  </h2>

                  <p className="text-xs text-gray-500">Confirm asset release</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={loading}
                className="
                  p-2
                  rounded-lg
                  text-gray-400
                  hover:bg-gray-100
                  hover:text-gray-700
                  transition
                  disabled:opacity-50
                "
              >
                <X size={19} />
              </button>
            </div>

            {/* ====================================
                Body
                ==================================== */}

            <div className="px-5 py-5">
              <p className="text-sm text-gray-600 mb-5">
                Are you sure you want to release this asset from the current
                employee?
              </p>

              {/* Asset Information */}

              <div
                className="
                  rounded-xl
                  bg-gray-50
                  border
                  border-gray-200
                  p-4
                  space-y-3
                "
              >
                <div className="flex justify-between gap-4">
                  <span className="text-xs text-gray-500">Asset</span>

                  <span className="text-sm font-medium text-gray-900">
                    {asset?.assetCode || asset?.name || "Unknown"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-xs text-gray-500">Employee</span>

                  <span className="text-sm font-medium text-gray-900">
                    {employee?.name || employee?.employeeName || "Unknown"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-xs text-gray-500">Received Date</span>

                  <span className="text-sm font-medium text-gray-900">
                    {asset?.receivedDate || "N/A"}
                  </span>
                </div>
              </div>

              {/* Error */}

              {error && (
                <div
                  className="
                    mt-4
                    rounded-lg
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                    text-sm
                    text-red-700
                  "
                >
                  {error}
                </div>
              )}
            </div>

            {/* ====================================
                Footer
                ==================================== */}

            <div
              className="
                flex
                items-center
                justify-end
                gap-3
                px-5
                py-4
                border-t
                border-gray-100
                bg-gray-50
              "
            >
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={loading}
                className="
                  px-4
                  py-2
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  text-gray-700
                  text-sm
                  font-medium
                  hover:bg-gray-100
                  transition
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRelease}
                disabled={loading}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-4
                  py-2
                  rounded-lg
                  bg-red-600
                  text-white
                  text-sm
                  font-medium
                  hover:bg-red-700
                  transition
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Releasing...
                  </>
                ) : (
                  <>
                    <PackageCheck size={17} />
                    Confirm Release
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReleaseAsset;
