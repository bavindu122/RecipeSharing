const jwt = require("jsonwebtoken");

/**
 * Verifies Bearer token from Authorization header and populates req.user
 * Header format: Authorization: Bearer <token>
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.toString().startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "dev_secret";
    const decoded = jwt.verify(token, secret);
    // attach minimal user info for downstream handlers
    req.user = { id: decoded.id, userName: decoded.userName };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
