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

const EMPTY_USER = {
  username: "",
  role: "",
  password: "",
};

function UserSetting() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [userForm, setUserForm] = useState(EMPTY_USER);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/users`,
        {
          withCredentials: true,
        }
      );

      setUsers(response.data || []);
    } catch (error) {
      console.error("Failed to load users:", error);
      alert("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setUserForm(EMPTY_USER);
  };

  const openAddUser = () => {
    setEditingItem(null);
    setUserForm(EMPTY_USER);
    setShowModal(true);
  };

  const openEditUser = (user) => {
    setEditingItem(user);

    setUserForm({
      username: user.username || "",
      password: user.password || "",
      role: user.role || "",
    });

    setShowModal(true);
  };

  const saveUser = async (e) => {
    e.preventDefault();

    if (!userForm.username.trim() || !userForm.password.trim()) {
      alert("Username and password are required.");
      return;
    }

    if (!userForm.role.trim()) {
      alert("Role is required.");
      return;
    }

    try {
      setSaving(true);

      if (editingItem) {
        await axios.patch(
          `${API_BASE_URL}/users/${editingItem._id}`,
          userForm,
          {
            withCredentials: true,
          }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/users`,
          userForm,
          {
            withCredentials: true,
          }
        );
      }

      closeModal();
      await fetchUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
      alert("Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${user.username}"?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/users/${user._id}`,
        {
          withCredentials: true,
        }
      );

      await fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user.");
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return users;

    return users.filter((user) =>
      `${user.username} ${user._id}`
        .toLowerCase()
        .includes(query)
    );
  }, [users, search]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/40 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-5 border-b border-slate-300 pb-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                User Settings
              </h1>

              <p className="text-sm text-slate-500">
                Manage system users and roles
              </p>
            </div>

            <div className="flex gap-3">

              {/* SEARCH */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full rounded-lg border border-slate-400 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                onClick={openAddUser}
                className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add User
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
              <table className="w-full min-w-162.5">

                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-left">
                    <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">
                      Username
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">
                      Role
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">
                      Password
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
                          {user.username}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {user.role}
                      </td>

                      <td className="px-5 py-4 font-mono text-sm text-slate-500">
                        {user.password}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() => openEditUser(user)}
                            className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => deleteUser(user)}
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

              {filteredUsers.length === 0 && (
                <EmptyState text="No users found." />
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
                  {editingItem ? "Edit User" : "Add User"}
                </h2>

                <p className="text-xs text-slate-400">
                  Update user information
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
              onSubmit={saveUser}
              className="space-y-4 p-5"
            >
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

              <SelectField
                label="Role"
                value={userForm.role}
                onChange={(value) =>
                  setUserForm((prev) => ({
                    ...prev,
                    role: value,
                  }))
                }
                options={["User", "Admin"]}
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
        className="w-full rounded-lg border border-slate-400 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options = [],
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">Select role</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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

export default UserSetting;