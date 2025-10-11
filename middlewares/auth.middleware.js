import jwt from "jsonwebtoken";
import User from "../models/user.modle.js"; // corrected filename

export const protect = async (req, res, next) => {
  let token;

  try {
    // Check for Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify token asynchronously
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        });
      });


      // Find user by id (full user including password and __v)
      const user = await User.findOne({ _id: decoded.id });
      if (!user) {
        return res
          .status(401)
          .json({ error: true, message: "User not found" });
      }

      req.user = user; // attach user to request
      return next();
    } else {
      return res
        .status(401)
        .json({ error: true, message: "Not authorized, token missing" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res
      .status(401)
      .json({ error: true, message: "Not authorized, token failed" });
  }
};
