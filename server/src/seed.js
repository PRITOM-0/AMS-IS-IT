import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db.js";

import Asset from "./models/Asset.js";
import Employee from "./models/Employee.js";
import Vendor from "./models/Vendor.js";
import Service from "./models/Service.js";
import Task from "./models/Task.js";
import User from "./models/User.js";
import List from "./models/List.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Clearing existing dummy data...");

    await Asset.deleteMany({});
    await Employee.deleteMany({});
    await Vendor.deleteMany({});
    await Service.deleteMany({});
    await Task.deleteMany({});
    await User.deleteMany({});
    await List.deleteMany({});

    // ==========================================
    // USER
    // ==========================================

    const user = await User.create({
      id: "USR-001",
      username: "admin1",
      password: "123456",
      role: "admin",
      email: "admin1@company.com",
      employeeCode: "EMP-001",
      designation: "System Admin",
      approvallist: ["A1", "A2", "A3"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // ==========================================
    // EMPLOYEE
    // ==========================================

    const employee = await Employee.create({
      id: "EMP-001",
      employeeName: "Mahmudul Hassan",
      employeeId: "904740",
      designation: "Jr. IT Officer",
      company: "SPL",
      location: "CORP",
      department: "IT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assetlist: [],
      assethistory: []
    });

    // ==========================================
    // VENDOR
    // ==========================================

    const vendor = await Vendor.create({
      id: "VND-001",
      vendorId: "VND001",
      vendorName: "EXECUTIVE TECHNOLOGIES LTD",
      contactPerson: "Abdul Karim",
      contact: "01700000000",
      address: "Dhaka, Bangladesh",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // ==========================================
    // ASSET
    // ==========================================

    const asset = await Asset.create({
      id: "AST-001",
      equipment: "CPU",
      assetCode: "06-01-01-0627",
      brand: "Acer",
      model: "Veriton M200-H81",
      serialNumber: "SN-TEST-001",
      specifications:
        "MB: Acer-H81, Processor: Intel Core i3 3.50 GHz, RAM: 4GB DDR3 1600MHz, 240GB SSD",
      macAddress: "00:71:c2:0b:b5:76",

      company: "SPL",
      location: "CORP",
      department: "IT",
      floor: "Ground Floor",
      room: "IT Room",

      status: "Active",
      employeeId: employee.id,

      receivedDate: new Date().toISOString(),

      oldUsers: [
        {
          employeeName: "Mahmudul Hassan",
          employeeId: "904740",
          receivedDate: new Date().toISOString(),
          releaseDate: ""
        }
      ],

      purchaseDate: "10th Dec-2015",
      purchasePrice: "50000",

      warrantyStart: "10th Dec-2015",
      warrantyEnd: "",
      warrantyYears: "1",

      vendorId: vendor.id,

      remarks: "Dummy test asset",

      surveyStatus: "OK",
      upgradeEquipments: "",
      surveyTakenBy: "admin1",

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // ==========================================
    // UPDATE EMPLOYEE ASSET LIST
    // ==========================================

    employee.assetlist = [asset.id];

    await employee.save();

    // ==========================================
    // SERVICE
    // ==========================================

    const service = await Service.create({
      id: "SRV-001",
      assetId: asset.id,
      type: "repair",
      vendorName: "EXECUTIVE TECHNOLOGIES LTD",
      serviceCost: "5000",
      serviceWarranty: "1 year",
      remarks: "Dummy repair service",
      serviceDate: "2026-09-20",
      status: "Complete",
      createAt: new Date().toISOString(),
      updateAt: new Date().toISOString()
    });

    // ==========================================
    // TASK
    // ==========================================

    const task = await Task.create({
      id: "TSK-001",
      taskId: "TSK-20260920-001",
      taskCode: "100001",
      taskName: "CPU maintenance",

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      assetId: asset.id,
      assetName: asset.equipment,
      assetCode: asset.assetCode,
      equipment: asset.equipment,

      username: employee.employeeName,

      company: employee.company,
      location: employee.location,

      complainMode: "Phone",
      complainDate: "2026-09-20T10:00",

      itPersonName: user.username,

      progress: "pending",
      priority: "Medium",

      taskStartDate: "",
      taskCompleteDate: "",
      taskFinishingDate: "",

      days: 0,
      timeDuration: "0 hours",

      reasonForDelay: "",

      mainCategory: "General",
      subCategory: "Hardware",

      issueSummary: "Dummy CPU maintenance task",
      stepInDetails: ""
    });

    // ==========================================
    // LIST
    // ==========================================

    const list = await List.create({
      company: [
        "SPL",
        "ETC",
        "IPL",
        "STS",
        "ITL",
        "PCL",
        "SPEED",
        "AHL",
        "KHL",
        "RVL",
        "Others"
      ],

      Location: [
        "CORP",
        "SRU",
        "SRM",
        "JRB",
        "JRG",
        "JRD",
        "JRU-3",
        "Kitchen",
        "KLOTH"
      ],

      department: [
        "SRD",
        "Administration",
        "Faculty",
        "Student Affairs and Events",
        "IT",
        "Security",
        "HR",
        "Finance"
      ],

      assetStatuses: [
        "Instock",
        "Active",
        "Inactive",
        "Removal"
      ],

      surveyStatuses: [
        "OK",
        "Update",
        "Replace",
        "Repair/Service"
      ],

      taskStatuses: [
        "pending",
        "On Process",
        "Completed"
      ],

      equipment: [
        "CPU",
        "Monitor",
        "UPS",
        "Scanner",
        "Laptop",
        "Webcam",
        "Headphone",
        "Router",
        "Switch",
        "Printer",
        "Projector"
      ],

      validateEquipments: [
        {
          CPU: "06-01-01-####",
          Monitor: "06-01-06-####",
          UPS: "06-01-05-####",
          Scanner: "06-01-04-####",
          Laptop: "06-01-03-####",
          Webcam: null,
          Headphone: null,
          Router: "06-01-09-####",
          Switch: "06-01-09-####",
          Printer: "##-01-02-####",
          Projector: "05-01-03-####"
        }
      ],

      brand: [
        "Acer",
        "Lenovo",
        "Dell",
        "HP",
        "Canon",
        "Epson",
        "Logitech",
        "Samsung"
      ]
    });

    console.log("");
    console.log("=================================");
    console.log("       DATABASE SEEDED");
    console.log("=================================");
    console.log(`User     : ${user.id}`);
    console.log(`Employee : ${employee.id}`);
    console.log(`Vendor   : ${vendor.id}`);
    console.log(`Asset    : ${asset.id}`);
    console.log(`Service  : ${service.id}`);
    console.log(`Task     : ${task.id}`);
    console.log(`List     : ${list._id}`);
    console.log("=================================");
    console.log("");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedDatabase();