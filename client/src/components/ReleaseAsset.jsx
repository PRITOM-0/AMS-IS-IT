import React, { useState } from "react";
import { X, PackageCheck, Loader2, AlertTriangle, FileText } from "lucide-react";
import { API_BASE_URL } from "../env";

const ReleaseAsset = ({ employee, asset, onReleased }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [releaseNote, setReleaseNote] = useState("");

  // ==========================================
  // Open Confirmation Modal
  // ==========================================

  const handleOpenModal = () => {
    setError("");
    setReleaseNote("");
    setShowModal(true);
  };

  // ==========================================
  // Close Modal
  // ==========================================

  const handleCloseModal = () => {
    if (loading) return;

    setShowModal(false);
    setError("");
    setReleaseNote("");
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

    if (!releaseNote.trim()) {
      setError("Please provide a release note.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const employeeName = employee?.employeeName || employee?.name || "";
      const receivedDate = asset?.receivedDate || "";
      const releaseDate = new Date().toISOString();

      // Create Old User Object with Release Note
      const oldUser = {
        employeeName,
        employeeId: employee?.employeeId || "",
        receivedDate,
        releaseDate,
        releaseNote: releaseNote.trim(),
      };

      const oldUsers = Array.isArray(asset?.oldUsers) ? asset.oldUsers : [];

      // 1. Prepare updated Asset payload
      const updatedAsset = {
        ...asset,
        employeeId: "",
        receivedDate: "",
        oldUsers: [...oldUsers, oldUser],
      };

      // 2. Safely filter out the asset ID from employee assetlist
      const currentAssetList = Array.isArray(employee?.assetlist)
        ? employee.assetlist
        : [];

      const updatedAssetList = currentAssetList.filter(
        (assetId) => String(assetId) !== String(asset.id)
      );

      const updatedEmployee = {
        ...employee,
        assetlist: updatedAssetList,
      };

      // 3. Fire BOTH PUT requests concurrently
      const [assetRes, employeeRes] = await Promise.all([
        fetch(`${API_BASE_URL}/assets/${asset.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedAsset),
        }),
        fetch(`${API_BASE_URL}/employees/${employee.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedEmployee),
        }),
      ]);

      // 4. Validate Asset Response
      if (!assetRes.ok) {
        const responseText = await assetRes.text();
        throw new Error(responseText || "Failed to update asset information.");
      }

      // 5. Validate Employee Response
      if (!employeeRes.ok) {
        const responseText = await employeeRes.text();
        throw new Error(
          responseText || "Asset was updated, but failed to remove asset from employee."
        );
      }

      const savedAsset = await assetRes.json();
      const savedEmployee = await employeeRes.json();

      // 6. Complete flow
      handleCloseModal();

      if (onReleased) {
        onReleased({
          asset: savedAsset,
          employee: savedEmployee,
        });
      }
    } catch (err) {
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
      {/* Release Button */}
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

      {/* Confirmation Modal */}
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
            {/* Modal Header */}
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

            {/* Modal Body */}
            <div className="px-5 py-5 space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to release this asset from the current
                employee?
              </p>

              {/* Asset Details summary */}
              <div
                className="
                  rounded-xl
                  bg-gray-50
                  border
                  border-gray-200
                  p-4
                  space-y-2.5
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
                    {asset?.receivedDate
                      ? new Date(asset.receivedDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>

              {/* Release Note Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="releaseNote"
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-700"
                >
                  <FileText size={14} className="text-gray-400" />
                  Release Note <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="releaseNote"
                  rows={3}
                  value={releaseNote}
                  onChange={(e) => setReleaseNote(e.target.value)}
                  placeholder="e.g., Returned in good condition / Upgrade issued / Employee left company"
                  disabled={loading}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-3
                    py-2
                    text-xs
                    text-gray-900
                    placeholder-gray-400
                    focus:border-red-500
                    focus:outline-none
                    focus:ring-1
                    focus:ring-red-500
                    disabled:bg-gray-50
                  "
                />
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="
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

            {/* Modal Footer */}
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