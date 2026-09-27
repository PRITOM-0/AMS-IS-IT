import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  ChevronDown,
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

const LIST_ORDER = [
  "equipment",
  "brand",
  "company",
  "Location",
  "department",
  "assetStatuses",
  "taskStatuses",
  "surveyStatuses",
];

function CompanyInfoSetting() {
  const [list, setList] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [selectedListKey, setSelectedListKey] = useState("");
  const [listValue, setListValue] = useState("");
  const [assetCodePattern, setAssetCodePattern] = useState("");

  const fetchList = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/list`,
        {
          withCredentials: true,
        }
      );

      setList(response.data || {});
    } catch (error) {
      console.error("Failed to load company information:", error);
      alert("Failed to load company information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);

    setSelectedListKey("");
    setListValue("");
    setAssetCodePattern("");
  };

  const listEntries = useMemo(() => {
    return Object.entries(list)
      .filter(([key]) => LIST_LABELS[key])
      .sort(
        ([firstKey], [secondKey]) =>
          LIST_ORDER.indexOf(firstKey) -
          LIST_ORDER.indexOf(secondKey)
      );
  }, [list]);

  const filteredEntries = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return listEntries;

    return listEntries
      .map(([key, values]) => {
        if (!Array.isArray(values)) {
          return [key, values];
        }

        const filteredValues = values.filter((value) =>
          String(value).toLowerCase().includes(query)
        );

        return [key, filteredValues];
      })
      .filter(([key, values]) => {
        if (!Array.isArray(values)) return true;
        return values.length > 0;
      });
  }, [listEntries, search]);

  const sortedListValues = (values) =>
    values
      .map((value, index) => ({
        value,
        index,
      }))
      .sort(
        ({ value: firstValue }, { value: secondValue }) =>
          firstValue.localeCompare(
            secondValue,
            undefined,
            {
              sensitivity: "base",
              numeric: true,
            }
          )
      );

  const openAddListValue = (key) => {
    setEditingItem(null);

    setSelectedListKey(key);
    setListValue("");
    setAssetCodePattern("");

    setShowModal(true);
  };

  const openEditListValue = (key, index, value) => {
    setEditingItem({
      key,
      index,
      value,
    });

    setSelectedListKey(key);
    setListValue(value);

    if (key === "equipment") {
      const existingPattern =
        list.validateEquipments?.[0]?.[value] || "";

      setAssetCodePattern(existingPattern);
    } else {
      setAssetCodePattern("");
    }

    setShowModal(true);
  };

  const saveListValue = async (e) => {
    e.preventDefault();

    const value = listValue.trim();

    if (!value) {
      alert("Please enter a value.");
      return;
    }

    // EQUIPMENT
    if (selectedListKey === "equipment") {
      const pattern = assetCodePattern.trim();

      if (!pattern) {
        alert("Asset code pattern is required for equipment.");
        return;
      }

      if (!pattern.includes("#")) {
        alert(
          "Please enter a valid asset code pattern using # or ####."
        );
        return;
      }

      const currentEquipment = Array.isArray(list.equipment)
        ? [...list.equipment]
        : [];

      const currentValidation =
        list.validateEquipments?.[0] || {};

      const updatedEquipment = [...currentEquipment];

      const updatedValidation = {
        ...currentValidation,
      };

      if (editingItem) {
        const oldValue = editingItem.value;

        const duplicate = currentEquipment.some(
          (item, index) =>
            item.toLowerCase() === value.toLowerCase() &&
            index !== editingItem.index
        );

        if (duplicate) {
          alert("This equipment already exists.");
          return;
        }

        updatedEquipment[editingItem.index] = value;

        delete updatedValidation[oldValue];

        updatedValidation[value] = pattern;
      } else {
        const exists = currentEquipment.some(
          (item) =>
            item.toLowerCase() === value.toLowerCase()
        );

        if (exists) {
          alert("This equipment already exists.");
          return;
        }

        updatedEquipment.push(value);
        updatedValidation[value] = pattern;
      }

      try {
        setSaving(true);

        await axios.patch(
          `${API_BASE_URL}/list`,
          {
            equipment: updatedEquipment,
            validateEquipments: [updatedValidation],
          },
          {
            withCredentials: true,
          }
        );

        closeModal();
        await fetchList();
      } catch (error) {
        console.error(
          "Failed to save equipment:",
          error
        );

        alert("Failed to save equipment.");
      } finally {
        setSaving(false);
      }

      return;
    }

    // OTHER LISTS
    const currentValues = Array.isArray(
      list[selectedListKey]
    )
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

      await axios.patch(
        `${API_BASE_URL}/list`,
        {
          [selectedListKey]: currentValues,
        },
        {
          withCredentials: true,
        }
      );

      closeModal();
      await fetchList();
    } catch (error) {
      console.error(
        "Failed to save list value:",
        error
      );

      alert("Failed to save list value.");
    } finally {
      setSaving(false);
    }
  };

  const deleteListValue = async (
    key,
    index,
    value
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${value}"?`
    );

    if (!confirmed) return;

    const currentValues = Array.isArray(list[key])
      ? [...list[key]]
      : [];

    currentValues.splice(index, 1);

    try {
      setSaving(true);

      if (key === "equipment") {
        const currentValidation =
          list.validateEquipments?.[0] || {};

        const updatedValidation = {
          ...currentValidation,
        };

        delete updatedValidation[value];

        await axios.patch(
          `${API_BASE_URL}/list`,
          {
            equipment: currentValues,
            validateEquipments: [updatedValidation],
          },
          {
            withCredentials: true,
          }
        );
      } else {
        await axios.patch(
          `${API_BASE_URL}/list`,
          {
            [key]: currentValues,
          },
          {
            withCredentials: true,
          }
        );
      }

      await fetchList();
    } catch (error) {
      console.error(
        "Failed to delete list value:",
        error
      );

      alert("Failed to delete list value.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/40 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-5 border-b border-slate-300 pb-5">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Company Information
              </h1>

              <p className="text-sm text-slate-500">
                Manage system lists and equipment settings
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search company information..."
                className="w-full rounded-lg border border-slate-400 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

          </div>
        </div>

        {/* CONTENT */}
        <div className="overflow-hidden rounded-xl border border-slate-400 bg-white">

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-500 border-t-indigo-600" />
            </div>
          ) : (
            <div className="p-5">

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                {filteredEntries.map(
                  ([key, values]) => {

                    if (!Array.isArray(values)) {
                      return null;
                    }

                    return (
                      <div
                        key={key}
                        className="overflow-hidden rounded-xl border border-slate-400 bg-white"
                      >

                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b border-slate-300 bg-slate-50 p-4">

                          <div>
                            <h3 className="font-bold text-slate-800">
                              {LIST_LABELS[key]}
                            </h3>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {values.length} values
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              openAddListValue(key)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                          >
                            <Plus className="h-4 w-4" />
                          </button>

                        </div>

                        {/* VALUES */}
                        <div className="max-h-80 overflow-y-auto p-3">

                          {sortedListValues(values).map(
                            ({ value, index }, displayIndex) => {

                              const equipmentPattern =
                                key === "equipment"
                                  ? list
                                      .validateEquipments?.[0]?.[
                                      value
                                    ]
                                  : null;

                              return (
                                <div
                                  key={`${key}-${index}`}
                                  className="group mb-2 flex items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 hover:border-indigo-400 hover:bg-indigo-50/30"
                                >

                                  <div className="flex min-w-0 items-center gap-2">

                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                                      {displayIndex + 1}
                                    </span>

                                    <div className="min-w-0">

                                      <div className="truncate text-sm font-medium text-slate-700">
                                        {value}
                                      </div>

                                      {key === "equipment" && (
                                        <div className="mt-0.5 font-mono text-[11px] text-indigo-600">
                                          {equipmentPattern ||
                                            "No code pattern"}
                                        </div>
                                      )}

                                    </div>
                                  </div>

                                  <div className="ml-2 flex shrink-0 gap-1 opacity-0 group-hover:opacity-100">

                                    <button
                                      onClick={() =>
                                        openEditListValue(
                                          key,
                                          index,
                                          value
                                        )
                                      }
                                      className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>

                                    <button
                                      onClick={() =>
                                        deleteListValue(
                                          key,
                                          index,
                                          value
                                        )
                                      }
                                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>

                                  </div>
                                </div>
                              );
                            }
                          )}

                          {values.length === 0 && (
                            <div className="py-8 text-center text-xs text-slate-400">
                              No values
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  }
                )}

              </div>
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
                  {editingItem
                    ? `Edit ${
                        selectedListKey === "equipment"
                          ? "Equipment"
                          : "List Value"
                      }`
                    : `Add ${
                        selectedListKey === "equipment"
                          ? "Equipment"
                          : "List Value"
                      }`}
                </h2>

                <p className="text-xs text-slate-400">
                  Update system configuration
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
              onSubmit={saveListValue}
              className="space-y-4 p-5"
            >

              {/* LIST TYPE */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Company Info
                </label>

                <div className="relative">

                  <select
                    value={selectedListKey}
                    onChange={(e) => {
                      const key = e.target.value;

                      setSelectedListKey(key);
                      setListValue("");
                      setAssetCodePattern("");
                    }}
                    disabled={!!editingItem}
                    className="w-full appearance-none rounded-lg border border-slate-400 bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:border-indigo-500 disabled:bg-slate-50"
                  >
                    <option value="">
                      Select list
                    </option>

                    {listEntries.map(([key]) => (
                      <option
                        key={key}
                        value={key}
                      >
                        {LIST_LABELS[key]}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                </div>
              </div>

              {/* VALUE */}
              <InputField
                label={
                  selectedListKey === "equipment"
                    ? "Equipment Name"
                    : "Value"
                }
                value={listValue}
                onChange={setListValue}
                placeholder={
                  selectedListKey === "equipment"
                    ? "Enter equipment name"
                    : "Enter list value"
                }
              />

              {/* PATTERN */}
              {selectedListKey === "equipment" && (
                <div>

                  <InputField
                    label="Asset Code Pattern"
                    value={assetCodePattern}
                    onChange={setAssetCodePattern}
                    placeholder="e.g. 06-01-01-####"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Use # for variable digits and ####
                    for the unique 4-digit asset number.
                  </p>

                </div>
              )}

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
        onChange={(e) =>
          onChange(e.target.value)
        }
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

export default CompanyInfoSetting;