
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Store,
  List,
  X,
  Save,
  ChevronDown,
  Settings as SettingsIcon,
} from "lucide-react";
import { API_BASE_URL } from "../env";

const LIST_LABELS = {
  company: "Company",
  Location: "Location",
  department: "Department",
  assetStatuses: "Asset Status",
  surveyStatuses: "Survey Status",
  taskStatuses: "Task Status",
  equipment: "Equipment",
  brand: "Brand",
};

const EMPTY_USER = {
  username: "",
  password: "",
};

const EMPTY_VENDOR = {
  vendorId: "",
  vendorName: "",
  contactPerson: "",
  contact: "",
  address: "",
};

function Setting() {
  const [activeTab, setActiveTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [list, setList] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const [userForm, setUserForm] = useState(EMPTY_USER);
  const [vendorForm, setVendorForm] = useState(EMPTY_VENDOR);

  const [selectedListKey, setSelectedListKey] = useState("");
  const [listValue, setListValue] = useState("");

  // --------------------------------------------------
  // FETCH DATA
  // --------------------------------------------------

  const fetchData = async () => {
    try {
      setLoading(true);

      const [usersResponse, vendorsResponse, listResponse] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/users`),
          axios.get(`${API_BASE_URL}/vendors`),
          axios.get(`${API_BASE_URL}/list`),
        ]);

      setUsers(usersResponse.data || []);
      setVendors(vendorsResponse.data || []);
      setList(listResponse.data || {});
    } catch (error) {
      console.error("Failed to load settings data:", error);
      alert("Failed to load settings data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --------------------------------------------------
  // MODAL
  // --------------------------------------------------

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setEditingItem(null);
    setUserForm(EMPTY_USER);
    setVendorForm(EMPTY_VENDOR);
    setSelectedListKey("");
    setListValue("");
  };

  // --------------------------------------------------
  // USERS
  // --------------------------------------------------

  const openAddUser = () => {
    setModalType("user");
    setEditingItem(null);
    setUserForm(EMPTY_USER);
    setShowModal(true);
  };

  const openEditUser = (user) => {
    setModalType("user");
    setEditingItem(user);

    setUserForm({
      username: user.username || "",
      password: user.password || "",
    });

    setShowModal(true);
  };

  const saveUser = async (e) => {
    e.preventDefault();

    if (!userForm.username.trim() || !userForm.password.trim()) {
      alert("Username and password are required.");
      return;
    }

    try {
      setSaving(true);

      if (editingItem) {
        await axios.patch(
          `${API_BASE_URL}/users/${editingItem.id}`,
          userForm,
        );
      } else {
        await axios.post(`${API_BASE_URL}/users`, {
          ...userForm,
          id: String(Date.now()),
        });
      }

      closeModal();
      await fetchData();
    } catch (error) {
      console.error("Failed to save user:", error);
      alert("Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${user.username}"?`,
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/users/${user.id}`);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user.");
    }
  };

  // --------------------------------------------------
  // VENDORS
  // --------------------------------------------------

  const openAddVendor = () => {
    setModalType("vendor");
    setEditingItem(null);

    setVendorForm({
      ...EMPTY_VENDOR,
      vendorId: `VND${String(vendors.length + 1).padStart(3, "0")}`,
    });

    setShowModal(true);
  };

  const openEditVendor = (vendor) => {
    setModalType("vendor");
    setEditingItem(vendor);

    setVendorForm({
      vendorId: vendor.vendorId || "",
      vendorName: vendor.vendorName || "",
      contactPerson: vendor.contactPerson || "",
      contact: vendor.contact || "",
      address: vendor.address || "",
    });

    setShowModal(true);
  };

  const saveVendor = async (e) => {
    e.preventDefault();

    if (!vendorForm.vendorId.trim() || !vendorForm.vendorName.trim()) {
      alert("Vendor ID and Vendor Name are required.");
      return;
    }

    try {
      setSaving(true);

      if (editingItem) {
        await axios.patch(
          `${API_BASE_URL}/vendors/${editingItem.id}`,
          vendorForm,
        );
      } else {
        await axios.post(`${API_BASE_URL}/vendors`, {
          ...vendorForm,
        });
      }

      closeModal();
      await fetchData();
    } catch (error) {
      console.error("Failed to save vendor:", error);
      alert("Failed to save vendor.");
    } finally {
      setSaving(false);
    }
  };

  const deleteVendor = async (vendor) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${vendor.vendorName}"?`,
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/vendors/${vendor.id}`);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete vendor:", error);
      alert("Failed to delete vendor.");
    }
  };

  // --------------------------------------------------
  // LIST VALUES
  // --------------------------------------------------

  const openAddListValue = (key) => {
    setModalType("list");
    setEditingItem(null);
    setSelectedListKey(key);
    setListValue("");
    setShowModal(true);
  };

  const openEditListValue = (key, index, value) => {
    setModalType("list");
    setEditingItem({
      key,
      index,
      value,
    });

    setSelectedListKey(key);
    setListValue(value);

    setShowModal(true);
  };

  const saveListValue = async (e) => {
    e.preventDefault();

    const value = listValue.trim();

    if (!value) {
      alert("Please enter a value.");
      return;
    }

    const currentValues = Array.isArray(list[selectedListKey])
      ? [...list[selectedListKey]]
      : [];

    if (editingItem) {
      currentValues[editingItem.index] = value;
    } else {
      if (currentValues.includes(value)) {
        alert("This value already exists.");
        return;
      }

      currentValues.push(value);
    }

    try {
      setSaving(true);

      await axios.patch(`${API_BASE_URL}/list`, {
        [selectedListKey]: currentValues,
      });

      closeModal();
      await fetchData();
    } catch (error) {
      console.error("Failed to save list value:", error);
      alert("Failed to save list value.");
    } finally {
      setSaving(false);
    }
  };

  const deleteListValue = async (key, index, value) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${value}"?`,
    );

    if (!confirmed) return;

    const currentValues = Array.isArray(list[key]) ? [...list[key]] : [];

    currentValues.splice(index, 1);

    try {
      await axios.patch(`${API_BASE_URL}/list`, {
        [key]: currentValues,
      });

      await fetchData();
    } catch (error) {
      console.error("Failed to delete list value:", error);
      alert("Failed to delete list value.");
    }
  };

  // --------------------------------------------------
  // FILTERING
  // --------------------------------------------------

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return users;

    return users.filter((user) =>
      `${user.username} ${user.id}`.toLowerCase().includes(query),
    );
  }, [users, search]);

  const filteredVendors = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return vendors;

    return vendors.filter((vendor) =>
      `${vendor.vendorId} ${vendor.vendorName} ${vendor.contactPerson} ${vendor.contact}`
        .toLowerCase()
        .includes(query),
    );
  }, [vendors, search]);

  const listEntries = useMemo(() => {
    return Object.entries(list).filter(([key]) => LIST_LABELS[key]);
  }, [list]);

  // --------------------------------------------------
  // TABS
  // --------------------------------------------------

  const tabs = [
    {
      id: "users",
      label: "Users",
      icon: Users,
      count: users.length,
    },
    {
      id: "vendors",
      label: "Vendors",
      icon: Store,
      count: vendors.length,
    },
    {
      id: "list",
      label: "Lists",
      icon: List,
      count: listEntries.length,
    },
  ];

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
                  <SettingsIcon className="h-5 w-5" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Settings
                  </h1>

                  <p className="text-sm text-slate-500">
                    Manage users, vendors and system lists
                  </p>
                </div>
              </div>
            </div>

            {/* SEARCH */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full rounded-xl border border-slate-500 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearch("");
                }}
                className={`group rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-sm"
                    : "border-slate-500 bg-white hover:border-indigo-500 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        active
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {tab.label}
                      </p>

                      <p className="text-xs text-slate-400">
                        Manage {tab.label.toLowerCase()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      active
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="rounded-2xl border border-slate-500 bg-white shadow-sm">
          {/* CONTENT HEADER */}
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-800">
                {activeTab === "users" && "User Management"}
                {activeTab === "vendors" && "Vendor Management"}
                {activeTab === "list" && "List Management"}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Changes are saved directly to your JSON database.
              </p>
            </div>

            {activeTab === "users" && (
              <button
                onClick={openAddUser}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700"
              >
                <Plus className="h-4 w-4" />
                Add User
              </button>
            )}

            {activeTab === "vendors" && (
              <button
                onClick={openAddVendor}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700"
              >
                <Plus className="h-4 w-4" />
                Add Vendor
              </button>
            )}
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-500 border-t-indigo-600" />
            </div>
          ) : (
            <>
              {/* USERS */}
              {activeTab === "users" && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          ID
                        </th>

                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Username
                        </th>

                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Password
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-slate-100 transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
                              {user.id}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-700">
                              {user.username}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="font-mono text-sm text-slate-500">
                              {user.password}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditUser(user)}
                                className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => deleteUser(user)}
                                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredUsers.length === 0 && (
                    <EmptyState text="No users found." />
                  )}
                </div>
              )}

              {/* VENDORS */}
              {activeTab === "vendors" && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Vendor ID
                        </th>

                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Vendor Name
                        </th>

                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Contact Person
                        </th>

                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Contact
                        </th>

                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Address
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredVendors.map((vendor) => (
                        <tr
                          key={vendor.id}
                          className="border-b border-slate-100 transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-mono text-xs font-semibold text-indigo-600">
                              {vendor.vendorId}
                            </span>
                          </td>

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
                                className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => deleteVendor(vendor)}
                                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                title="Delete"
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

              {/* LIST */}
              {activeTab === "list" && (
                <div className="p-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {listEntries.map(([key, values]) => (
                      <div
                        key={key}
                        className="overflow-hidden rounded-2xl border border-slate-500 bg-slate-50/50"
                      >
                        {/* LIST HEADER */}
                        <div className="flex items-center justify-between border-b border-slate-500 bg-white p-4">
                          <div>
                            <h3 className="font-bold text-slate-800">
                              {LIST_LABELS[key]}
                            </h3>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {values.length} values
                            </p>
                          </div>

                          <button
                            onClick={() => openAddListValue(key)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700"
                            title="Add value"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* VALUES */}
                        <div className="max-h-80 overflow-y-auto p-3">
                          {values.map((value, index) => (
                            <div
                              key={`${key}-${index}`}
                              className="group mb-2 flex items-center justify-between rounded-xl border border-slate-500 bg-white px-3 py-2.5 transition hover:border-indigo-500 hover:shadow-sm"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                                  {index + 1}
                                </span>

                                <span className="truncate text-sm font-medium text-slate-700">
                                  {value}
                                </span>
                              </div>

                              <div className="ml-2 flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                                <button
                                  onClick={() =>
                                    openEditListValue(key, index, value)
                                  }
                                  className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50"
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() =>
                                    deleteListValue(key, index, value)
                                  }
                                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {values.length === 0 && (
                            <div className="py-8 text-center text-xs text-slate-400">
                              No values
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          MODAL
      ====================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-800">
                  {modalType === "user" &&
                    (editingItem ? "Edit User" : "Add User")}

                  {modalType === "vendor" &&
                    (editingItem ? "Edit Vendor" : "Add Vendor")}

                  {modalType === "list" &&
                    (editingItem ? "Edit List Value" : "Add List Value")}
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Update your system configuration
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* USER FORM */}
            {modalType === "user" && (
              <form onSubmit={saveUser} className="space-y-4 p-5">
                <InputField
                  label="Username"
                  value={userForm.username}
                  onChange={(value) =>
                    setUserForm((prev) => ({
                      ...prev,
                      username: value,
                    }))
                  }
                  placeholder="Enter username"
                />

                <InputField
                  label="Password"
                  type="text"
                  value={userForm.password}
                  onChange={(value) =>
                    setUserForm((prev) => ({
                      ...prev,
                      password: value,
                    }))
                  }
                  placeholder="Enter password"
                />

                <ModalButtons
                  onCancel={closeModal}
                  saving={saving}
                />
              </form>
            )}

            {/* VENDOR FORM */}
            {modalType === "vendor" && (
              <form onSubmit={saveVendor} className="space-y-4 p-5">
                <InputField
                  label="Vendor ID"
                  value={vendorForm.vendorId}
                  onChange={(value) =>
                    setVendorForm((prev) => ({
                      ...prev,
                      vendorId: value,
                    }))
                  }
                  placeholder="VND001"
                />

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
                    className="w-full resize-none rounded-xl border border-slate-500 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <ModalButtons
                  onCancel={closeModal}
                  saving={saving}
                />
              </form>
            )}

            {/* LIST FORM */}
            {modalType === "list" && (
              <form onSubmit={saveListValue} className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    List
                  </label>

                  <div className="relative">
                    <select
                      value={selectedListKey}
                      onChange={(e) => setSelectedListKey(e.target.value)}
                      disabled={!!editingItem}
                      className="w-full appearance-none rounded-xl border border-slate-500 bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    >
                      <option value="">Select list</option>

                      {listEntries.map(([key]) => (
                        <option key={key} value={key}>
                          {LIST_LABELS[key]}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <InputField
                  label="Value"
                  value={listValue}
                  onChange={setListValue}
                  placeholder="Enter list value"
                />

                <ModalButtons
                  onCancel={closeModal}
                  saving={saving}
                />
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================
// REUSABLE COMPONENTS
// ======================================================

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-500 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function ModalButtons({ onCancel, saving }) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-slate-500 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
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

export default Setting;

