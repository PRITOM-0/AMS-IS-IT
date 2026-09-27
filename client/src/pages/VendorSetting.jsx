import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";
import { API_BASE_URL } from "../env";

const EMPTY_VENDOR = {
  vendorName: "",
  contactPerson: "",
  contact: "",
  address: "",
};

function VendorSetting() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [vendorForm, setVendorForm] = useState(EMPTY_VENDOR);

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/vendors`,
        {
          withCredentials: true,
        }
      );

      setVendors(response.data || []);
    } catch (error) {
      console.error("Failed to load vendors:", error);
      alert("Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setVendorForm(EMPTY_VENDOR);
  };

  const openAddVendor = () => {
    setEditingItem(null);
    setVendorForm(EMPTY_VENDOR);
    setShowModal(true);
  };

  const openEditVendor = (vendor) => {
    setEditingItem(vendor);

    setVendorForm({
      vendorName: vendor.vendorName || "",
      contactPerson: vendor.contactPerson || "",
      contact: vendor.contact || "",
      address: vendor.address || "",
    });

    setShowModal(true);
  };

  const saveVendor = async (e) => {
    e.preventDefault();

    if (!vendorForm.vendorName.trim()) {
      alert("Vendor name is required.");
      return;
    }

    try {
      setSaving(true);

      if (editingItem) {
        await axios.patch(
          `${API_BASE_URL}/vendors/${editingItem._id}`,
          vendorForm,
          {
            withCredentials: true,
          }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/vendors`,
          vendorForm,
          {
            withCredentials: true,
          }
        );
      }

      closeModal();
      await fetchVendors();
    } catch (error) {
      console.error("Failed to save vendor:", error);
      alert("Failed to save vendor.");
    } finally {
      setSaving(false);
    }
  };

  const deleteVendor = async (vendor) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${vendor.vendorName}"?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/vendors/${vendor._id}`,
        {
          withCredentials: true,
        }
      );

      await fetchVendors();
    } catch (error) {
      console.error("Failed to delete vendor:", error);
      alert("Failed to delete vendor.");
    }
  };

  const filteredVendors = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return vendors;

    return vendors.filter((vendor) =>
      `${vendor.vendorName} ${vendor.contactPerson} ${vendor.contact}`
        .toLowerCase()
        .includes(query)
    );
  }, [vendors, search]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/40 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-5 border-b border-slate-300 pb-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Vendor Settings
              </h1>

              <p className="text-sm text-slate-500">
                Manage vendors and supplier information
              </p>
            </div>

            <div className="flex gap-3">

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search vendors..."
                  className="w-full rounded-lg border border-slate-400 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                onClick={openAddVendor}
                className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add Vendor
              </button>

            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-xl border border-slate-400 bg-white">

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-500 border-t-indigo-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-225">

                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-left">

                    <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">
                      Vendor Name
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">
                      Contact Person
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">
                      Address
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase text-slate-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {filteredVendors.map((vendor) => (
                    <tr
                      key={vendor._id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {vendor.vendorName}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {vendor.contactPerson || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {vendor.contact || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-sm text-slate-500">
                        {vendor.address || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() => openEditVendor(vendor)}
                            className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => deleteVendor(vendor)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

              {filteredVendors.length === 0 && (
                <EmptyState text="No vendors found." />
              )}

            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-slate-300 px-5 py-4">

              <div>
                <h2 className="font-bold text-slate-800">
                  {editingItem ? "Edit Vendor" : "Add Vendor"}
                </h2>

                <p className="text-xs text-slate-400">
                  Update vendor information
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <form
              onSubmit={saveVendor}
              className="space-y-4 p-5"
            >

              <InputField
                label="Vendor Name"
                value={vendorForm.vendorName}
                onChange={(value) =>
                  setVendorForm((prev) => ({
                    ...prev,
                    vendorName: value,
                  }))
                }
                placeholder="Enter vendor name"
              />

              <InputField
                label="Contact Person"
                value={vendorForm.contactPerson}
                onChange={(value) =>
                  setVendorForm((prev) => ({
                    ...prev,
                    contactPerson: value,
                  }))
                }
                placeholder="Enter contact person"
              />

              <InputField
                label="Contact"
                value={vendorForm.contact}
                onChange={(value) =>
                  setVendorForm((prev) => ({
                    ...prev,
                    contact: value,
                  }))
                }
                placeholder="Phone / email"
              />

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Address
                </label>

                <textarea
                  value={vendorForm.address}
                  onChange={(e) =>
                    setVendorForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Enter vendor address"
                  className="w-full resize-none rounded-lg border border-slate-400 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <ModalButtons
                onCancel={closeModal}
                saving={saving}
              />

            </form>

          </div>
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-400 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function ModalButtons({ onCancel, saving }) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-300 pt-4">

      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-slate-400 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Changes"}
      </button>

    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex min-h-48 items-center justify-center text-sm text-slate-400">
      {text}
    </div>
  );
}

export default VendorSetting;