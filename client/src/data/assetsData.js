const assetsData = [
  {
    id: 1,
    assetCode: "AST-001",

    name: "Dell Laptop XPS 13",
    brand: "Dell",
    category: "Laptop",

    quantity: 1,

    status: "available", // available | assigned | maintenance | retired

    assignedTo: null, // userId or null

    location: "IT Room",

    purchaseDate: "2024-01-15",
    warranty: {
      start: "2024-01-15",
      end: "2027-01-15",
    },

    value: 1200,

    description: "High-performance ultrabook for developers",

    comments: [
      {
        text: "Initial setup complete",
        createdBy: "admin",
        date: "2024-01-16",
      }
    ],

    requests: [
      {
        requestedBy: "user1",
        status: "pending", // pending | approved | rejected
        date: "2024-02-01",
      }
    ],

    history: [
      {
        action: "created",
        performedBy: "admin",
        date: "2024-01-15",
      },
      {
        action: "assigned",
        performedBy: "admin",
        assignedTo: "user1",
        date: "2024-02-02",
      }
    ],

    createdAt: "2024-01-15",
    updatedAt: "2024-02-02",
  }
];

export default assetsData;