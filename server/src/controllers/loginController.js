import User from "../models/User.js";

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login", error: error.message });
  } 
}

export const logoutUser = async (req, res) => {
  try {
    // Implement logout logic here (e.g., invalidate token, clear session)
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Failed to logout", error: error.message });
  }

}

export const usersInfo = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
    
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};
