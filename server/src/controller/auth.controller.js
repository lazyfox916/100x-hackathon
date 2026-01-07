const User = require("../model/user.model");
const { sendToken } = require("../utils/jwt");

// Register new user (email + password)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "name, email and password are required" });

    // Prevent duplicate
    let existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password });

    // send token + set cookie
    return sendToken(user, 201, res);
  } catch (err) {
    console.error("register error", err);
    return res.status(500).json({ message: "Server error", err: err.message });
  }
};

// Login with email + password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });

    // find user and include password
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // login ok
    return sendToken(user, 200, res);
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Set or change password for authenticated user
exports.setPassword = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(userId).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // If user already has a password, require currentPassword
    if (user.password) {
      if (!currentPassword)
        return res.status(400).json({ message: "Current password required" });
      const ok = await user.comparePassword(currentPassword);
      if (!ok)
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    // return new token
    return sendToken(user, 200, res);
  } catch (err) {
    console.error("setPassword error", err);
    return res.status(500).json({ message: "Server error" });
  }
};
