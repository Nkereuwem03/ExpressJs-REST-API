const jwt = require("jsonwebtoken");
require("dotenv").config();

function verifyToken(req, res, next) {
  let token = req.headers["authorization"] || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Authentication token is missing" });
  }

  const tokenWithoutBearer = token.startsWith("Bearer ")
    ? token.slice(7)
    : token;

  jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
}

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
