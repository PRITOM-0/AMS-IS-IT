 
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Wrench,
  ArrowUpCircle,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { API_BASE_URL } from "../env";

// ======================================================
// INPUT COMPONENT
// IMPORTANT: Keep this OUTSIDE RepairService
// so input does not lose focus while typing.
// ======================================================

const Input = ({ label, name, type = "text", value, onChange }) => (
  <div>
    <label className="mb-1 block text-xs font-semibold text-slate-600">
      {label}
    </label>

    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full rounded-lg border border-slate-500 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
    />
  </div>
);


// ======================================================
// REPAIR SERVICE
// ======================================================

const RepairService = () => {
  const { id: assetId } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [type, setType] = useState("repair");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});


  // ======================================================
  // GET SERVICES
  // ======================================================

  const getServices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/services`);
      setServices(res.data);
    } catch (error) {
      console.error("Failed to load services:", error);
    }
  };

  useEffect(() => {
    getServices();
  }, []);


  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // ======================================================
  // EMPTY FORM
  // ======================================================

  const getEmptyForm = (serviceType) => ({
    assetId,
    type: serviceType,

    ...(serviceType === "repair"
      ? {
          vendorName: "",
          serviceCost: "",
          serviceWarranty: "",
          remarks: "",
          serviceDate: "",
        }
      : {
          equipment: "",
          price: "",
          vendorName: "",
          equipmentWarranty: "",
          remarks: "",
          serviceDate: "",
        }),

    status: "Open",
    createAt: new Date().toISOString(),
    updateAt: new Date().toISOString(),
  });


  // ======================================================
  // OPEN / CLOSE ADD FORM
  // ======================================================

  const openAddForm = (serviceType) => {
    // Clicking the same active button closes the form
    if (showForm && type === serviceType && !editId) {
      setShowForm(false);
      setForm({});
      return;
    }

    setType(serviceType);
    setEditId(null);
    setForm(getEmptyForm(serviceType));
    setShowForm(true);
  };


  // ======================================================
  // RESET FORM
  // ======================================================

  const handleReset = () => {
    if (editId) {
      const service = services.find(
        (item) => item.id === editId
      );

      if (service) {
        setForm({
          ...service,
          assetId,
          type: service.type,
        });
      }

      return;
    }

    setForm(getEmptyForm(type));
  };


  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (service) => {
    setType(service.type);
    setEditId(service.id);

    setForm({
      ...service,
      assetId,
      type: service.type,
    });

    setShowForm(true);
  };


  // ======================================================
  // SAVE
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const now = new Date().toISOString();

      const payload = {
        ...form,
        assetId,
        type,
        status: form.status || "Open",
        updateAt: now,
      };

      // New service
      if (!editId) {
        payload.id = `SRV-${Date.now()}`;
        payload.createAt = now;

        await axios.post(
          `${API_BASE_URL}/services`,
          payload
        );
      }

      // Update existing service
      else {
        const oldService = services.find(
          (service) => service.id === editId
        );

        payload.id = editId;

        // Keep original creation date
        payload.createAt =
          oldService?.createAt || form.createAt || now;

        await axios.put(
          `${API_BASE_URL}/services/${editId}`,
          payload
        );
      }

      setShowForm(false);
      setEditId(null);
      setForm({});

      await getServices();
    } catch (error) {
      console.error("Failed to save service:", error);
    }
  };


  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (serviceId) => {
    if (!window.confirm("Delete this service?")) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/services/${serviceId}`
      );

      setServices((prev) =>
        prev.filter((service) => service.id !== serviceId)
      );
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };


  // ======================================================
  // FILTER + NEWEST FIRST
  // ======================================================

  const assetServices = services
    .filter((service) => service.assetId === assetId)
    .sort(
      (a, b) =>
        new Date(b.createAt || 0) -
        new Date(a.createAt || 0)
    );

  const repairServices = assetServices.filter(
    (service) => service.type === "repair"
  );

  const upgradeServices = assetServices.filter(
    (service) => service.type === "upgrade"
  );


  // ======================================================
  // DATE FORMAT
  // ======================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };


  return (
    <div className="min-h-screen bg-slate-50 border rounded-2xl shadow-2xl p-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-500 bg-white text-slate-600 transition hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-600"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Repair & Upgrade
            </h1>

            
          </div>

        </div>


        {/* ==================================================
            FORM OPEN BUTTONS
        ================================================== */}

        <div className="flex gap-2">

          <button
            onClick={() => openAddForm("repair")}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              showForm && type === "repair" && !editId
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-blue-500 bg-blue-100 text-indigo-600  hover:bg-indigo-200  transition"
            }`}
          >
            <Wrench size={16} />
           Add Repair / Service
          </button>

          <button
            onClick={() => openAddForm("upgrade")}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              showForm && type === "upgrade" && !editId
                ? "border-green-600 bg-green-600 text-white"
                : "border-green-500 bg-green-100 text-green-600  hover:bg-green-200  transition"
            }`}
          >
            <ArrowUpCircle size={16} />
             Add Upgrade
          </button>

        </div>
      </div>


      {/* ==================================================
          FORM
      ================================================== */}

      {showForm && (
        <div className="mb-8 rounded-2xl border border-slate-500 bg-white p-6 shadow-sm">

          {/* Form Header */}
          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="font-bold text-slate-900">
                {editId ? "Edit" : "Add"}{" "}
                {type === "repair"
                  ? "Repair / Service"
                  : "Upgrade"}
              </h2>

            </div>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
                setForm({});
              }}
              className="rounded-lg border border-slate-500 p-2 text-slate-500 hover:border-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <X size={18} />
            </button>

          </div>


          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >

            {/* ================= REPAIR ================= */}

            {type === "repair" ? (
              <>
                <Input
                  label="Vendor Name"
                  name="vendorName"
                  value={form.vendorName}
                  onChange={handleChange}
                />

                <Input
                  label="Service Cost"
                  name="serviceCost"
                  type="number"
                  value={form.serviceCost}
                  onChange={handleChange}
                />

                <Input
                  label="Service Warranty"
                  name="serviceWarranty"
                  value={form.serviceWarranty}
                  onChange={handleChange}
                />

                <Input
                  label="Service Date"
                  name="serviceDate"
                  type="date"
                  value={form.serviceDate}
                  onChange={handleChange}
                />

                <Input
                  label="Remarks"
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                />
              </>
            ) : (

              /* ================= UPGRADE ================= */

              <>
                <Input
                  label="Equipment"
                  name="equipment"
                  value={form.equipment}
                  onChange={handleChange}
                />

                <Input
                  label="Price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                />

                <Input
                  label="Vendor Name"
                  name="vendorName"
                  value={form.vendorName}
                  onChange={handleChange}
                />

                <Input
                  label="Equipment Warranty"
                  name="equipmentWarranty"
                  value={form.equipmentWarranty}
                  onChange={handleChange}
                />

                <Input
                  label="Service Date"
                  name="serviceDate"
                  type="date"
                  value={form.serviceDate}
                  onChange={handleChange}
                />

                <Input
                  label="Remarks"
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                />
              </>
            )}


            {/* STATUS */}

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Status
              </label>

              <select
                name="status"
                value={form.status || "Open"}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-500 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="Open">Open</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Complete">Complete</option>
              </select>
            </div>


            {/* BUTTONS */}

            <div className="flex items-end gap-2">

              {/* ADD / UPDATE */}
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-indigo-700 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus size={16} />
                {editId ? "Update" : "Add"}
              </button>

              {/* RESET */}
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-500 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <RotateCcw size={15} />
                Reset
              </button>

            </div>

          </form>
        </div>
      )}


      {/* ==================================================
          REPAIR / SERVICE TABLE
      ================================================== */}

      <ServiceTable
        title="Repair / Service"
        data={repairServices}
        type="repair"
        formatDate={formatDate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />


      {/* ==================================================
          UPGRADE TABLE
      ================================================== */}

      <ServiceTable
        title="Upgrade"
        data={upgradeServices}
        type="upgrade"
        formatDate={formatDate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

    </div>
  );
};


// ======================================================
// TABLE
// ======================================================

const ServiceTable = ({
  title,
  data,
  type,
  formatDate,
  onEdit,
  onDelete,
}) => {
  const isRepair = type === "repair";

  return (
    <div className="mb-5">
      {/* HEADER */}
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-800">
            {title}
          </h2>
          <p className="text-xs font-medium text-slate-500">
            {data.length} record{data.length !== 1 && "s"}
          </p>
        </div>

        <span
          className={`rounded border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
            isRepair
              ? "border-orange-500 bg-orange-50 text-orange-700"
              : "border-blue-500 bg-blue-50 text-blue-700"
          }`}
        >
          {isRepair ? "Repair" : "Upgrade"}
        </span>
      </div>

      {/* CARDS CONTAINER (Max height to show ~3 cards, enables vertical scroll) */}
      <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1 hide-scrollbar">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-500 bg-slate-50 py-8 text-center">
            <span className="text-sm font-semibold text-slate-600">
              No {title.toLowerCase()} found
            </span>
          </div>
        ) : (
          data.map((service) => (
            <div
              key={service.id}
              className="flex flex-col rounded-lg border border-slate-300 p-2.5 shadow-xl transition-all hover:shadow-md"
            >
              {/* TOP SECTION: Icon, Colored Single-Row Stats, Actions */}
              <div className="flex items-center gap-3">
                
                {/* ICON */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
                    isRepair
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-blue-500 bg-blue-50 text-blue-600"
                  }`}
                >
                  {isRepair ? (
                    <Wrench size={16} strokeWidth={2.5} />
                  ) : (
                    <ArrowUpCircle size={18} strokeWidth={2.5} />
                  )}
                </div>

                {/* MAIN INFO (Color-Coded, Compact, Strictly One Row) */}
                <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
                  <div className="flex flex-nowrap items-center gap-2">
                    {isRepair ? (
                      <>
                        <CompactInfo label="Cost" value={`${service.serviceCost} TK`} theme="green" />
                        <CompactInfo label="Warranty" value={service.serviceWarranty} theme="yellow" />
                      </>
                    ) : (
                      <>
                        <CompactInfo label="Equip" value={service.equipment} theme="blue" />
                        <CompactInfo label="Price" value={`${service.price} TK`} theme="green" />
                        <CompactInfo label="Warranty" value={service.equipmentWarranty} theme="yellow" />
                      </>
                    )}

                    <CompactInfo label="Date" value={service.serviceDate} theme="purple" />
                    <CompactInfo
                      label="Created"
                      value={service.createAt ? formatDate(service.createAt) : "-"}
                      theme="gray"
                    />
                  </div>
                </div>

                {/* STATUS & ACTIONS */}
                <div className="flex shrink-0 items-center gap-2 border-l border-slate-300 pl-2">
                  <span
                    className={`hidden shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:block ${
                      service.status === "Complete"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : service.status === "Ongoing"
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-slate-500 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {service.status || "Open"}
                  </span>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onEdit(service)}
                      className="rounded border border-slate-500 p-1 text-slate-600 transition-colors hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700"
                      title="Edit"
                    >
                      <Pencil size={14} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => onDelete(service.id)}
                      className="rounded border border-slate-500 p-1 text-slate-600 transition-colors hover:border-red-500 hover:bg-red-50 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION: Vendor & Remarks (Own row, extra space for long text) */}
              {(service.vendorName || service.remarks) && (
                <div className="mt-2.5 ml-0 sm:ml-12 flex flex-col sm:flex-row gap-2 sm:gap-4 rounded border border-slate-500 bg-slate-50/70 px-3 py-1.5">
                  
                  {service.vendorName && (
                    <div className="flex-1 min-w-0">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        Vendor
                      </span>
                      <p className="text-xs font-semibold text-slate-800 break-words whitespace-normal leading-tight mt-0.5">
                        {service.vendorName}
                      </p>
                    </div>
                  )}

                  {service.remarks && (
                    <div className="flex-[2] min-w-0 border-t sm:border-t-0 sm:border-l border-slate-300 pt-1.5 sm:pt-0 sm:pl-4">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        Remarks
                      </span>
                      <p className="text-xs font-semibold text-slate-700 break-words whitespace-normal leading-tight mt-0.5">
                        {service.remarks}
                      </p>
                    </div>
                  )}

                </div>
              )}
              
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ==================================================
   COMPACT INFO (Color-Coded Badges)
================================================== */

const CompactInfo = ({ label, value, theme = "gray" }) => {
  // Theme dictionary for colorful, light backgrounds with 500-weight borders
  const themeClasses = {
    green: "border-emerald-500 bg-emerald-50 text-emerald-800",
    yellow: "border-amber-500 bg-amber-50 text-amber-800",
    blue: "border-sky-500 bg-sky-50 text-sky-800",
    purple: "border-purple-500 bg-purple-50 text-purple-800",
    gray: "border-slate-500 bg-slate-50 text-slate-800",
  };

  return (
    <div className={`flex items-center gap-1 shrink-0 rounded border px-1.5 py-1 ${themeClasses[theme]}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
        {label}:
      </span>
      <span className="text-sm font-bold">
        {value || "-"}
      </span>
    </div>
  );
};


/* ==================================================
   INFO ITEM
================================================== */

const InfoItem = ({ label, value }) => {
  return (
    <div className="min-w-0">

      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-3 py-2">

        <p className="truncate text-sm font-bold text-slate-800">
          {value || "-"}
        </p>

      </div>

    </div>
  );
};




export default RepairService;
 