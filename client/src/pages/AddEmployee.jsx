 
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  Save,
  Building2,
  MapPin,
  Briefcase,
  Layers,
  Hash,
  User,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../env";

function AddEmployee() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeName: "",
    employeeId: "",
    designation: "",
    company: "",
    location: "",
    department: "",
  });

  const [list, setList] = useState({
    company: [],
    Location: [],
    department: [],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  // --------------------------------------------------
  // FETCH LIST DATA
  // --------------------------------------------------

  useEffect(() => {
    const fetchList = async () => {
      try {
        setListLoading(true);

        const response = await axios.get(`${API_BASE_URL}/list`);

        setList({
          company: response.data?.company || [],
          Location: response.data?.Location || [],
          department: response.data?.department || [],
        });
      } catch (error) {
        console.error("Failed to load list data:", error);
        setError("Failed to load company, location and department data.");
      } finally {
        setListLoading(false);
      }
    };

    fetchList();
  }, []);

  // --------------------------------------------------
  // HANDLE INPUT
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.employeeName.trim() 
    ) {
      setError("Please fill all required fields (*)");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const now = new Date().toISOString();

      const newEmployee = {
        id:now+"",
        employeeName: formData.employeeName.trim(),
        employeeId: formData.employeeId.trim(),
        designation: formData.designation.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        department: formData.department.trim(),

        createdAt: now,
        updatedAt: now,
      };

      await axios.post(`${API_BASE_URL}/employees`, newEmployee);

      navigate("/employees");
    } catch (error) {
      console.error("Failed to add employee:", error);

      setError(
        error.response?.data?.message ||
          "Failed to add employee. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // STYLES
  // --------------------------------------------------

  const inputClass =
    "w-full rounded-xl border border-slate-500 bg-white px-3 py-2.5 pl-10 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

  const selectClass =
    "w-full appearance-none rounded-xl border border-slate-500 bg-white px-3 py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">

        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => navigate("/employees")}
          className="mb-5 flex items-center gap-2 rounded-xl border border-indigo-500 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-600 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </button>

        {/* CARD */}
        <div className="overflow-hidden rounded-2xl border border-slate-500 bg-white shadow-sm">

          {/* HEADER */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
                <UserPlus className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Add Employee
                </h1>

                <p className="text-sm text-slate-500">
                  Create a new employee record
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-6">

            {/* ERROR */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-500 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* EMPLOYEE NAME */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Employee Name <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* EMPLOYEE ID */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Employee ID  
                </label>

                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="e.g. EMP-101"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* DESIGNATION */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Designation 
                </label>

                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* COMPANY */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Company 
                </label>

                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={listLoading}
                    className={selectClass}
                  >
                    <option value="">
                      {listLoading ? "Loading companies..." : "Select company"}
                    </option>

                    {list.company.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* LOCATION */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Location  
                </label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={listLoading}
                    className={selectClass}
                  >
                    <option value="">
                      {listLoading ? "Loading locations..." : "Select location"}
                    </option>

                    {list.Location.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* DEPARTMENT */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Department 
                </label>

                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={listLoading}
                    className={selectClass}
                  >
                    <option value="">
                      {listLoading
                        ? "Loading departments..."
                        : "Select department"}
                    </option>

                    {list.department.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {/* INFO */}
            <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
              <p className="text-xs leading-5 text-indigo-700">
                <span className="font-bold">Note:</span>{" "}
                Company, Location and Department options are loaded from the
                system list.
              </p>
            </div>

            {/* BUTTONS */}
            <div className="mt-6 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/employees")}
                disabled={loading}
                className="rounded-xl border border-slate-500 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || listLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Employee
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddEmployee;
 
