const Patient = require("../patients/models/Patient");

const hasNoProfile = async (req, res, next) => {
  // must follow auth middleware
  if (!req.user) {
    return res.status(401).json({ detail: "Access Denied.No token Provided" });
  }
  const userId = req.user._id;
  const patient = await Patient.findOne({ user: userId });
  if (patient) {
    return res
      .status(403)
      .json({ detail: "Forbidden! Your account is already in sync" });
  }
  next();
};

module.exports = hasNoProfile;
