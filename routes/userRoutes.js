const express = require("express");
const {
  currentUser,
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
} = require("../controllers/userControllers");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);
router.get("/admin", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});
router.get(
  "/current-user",
  verifyToken,
  authorizeRoles("user", "admin"),
  currentUser
);

module.exports = router;
