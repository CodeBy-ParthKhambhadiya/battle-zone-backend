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
      token = req.headers.authorization.split(" ")[1];

      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        });
      });


      const user = await User.findOne({ _id: decoded.id });
      if (!user) {
        return res
          .status(401)
          .json({ error: true});
      }

      req.user = user; 
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
