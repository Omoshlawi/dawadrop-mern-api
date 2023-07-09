const { Router } = require("express");
const auth = require("../middleware/auth");
const Patient = require("./models/Patient");
const { profileValidator } = require("./validators");
const { getValidationErrrJson } = require("../utils/helpers");
const { searchPatient, sendOtp } = require("./api");
const AccountVerification = require("./models/AccountVerification");
const moment = require("moment/moment");
const hasProfile = require("../middleware/hasProfile");
const router = Router();

router.get("/", auth, async (req, res) => {
  const patients = await Patient.find().populate("user");
  res.json({ results: patients });
});
router.post("/create-profile", [auth, hasProfile], async (req, res) => {
  try {
    const { cccNumber, firstName, upiNo } = await profileValidator(req.body);
    const remotePatient = await searchPatient(cccNumber);
    if (!remotePatient)
      throw Error("Verification Error!CCC Number / First Name do not match");
    if (remotePatient.f_name !== firstName)
      throw Error("Verification Error!CCC Number / First Name do not match");
    if (upiNo && remotePatient.upi_no !== upiNo)
      throw Error(
        "Verification Error!UPU Number / First Name / CCC Number do not match"
      );

    const patient = await Patient.getOrCreatePatientFromRemote(remotePatient);
    if (patient.user) {
      throw {
        status: 403,
        message: "User with provided CCC Number already exist",
      };
    }
    const verification = await AccountVerification.getOrCreate({
      user: req.user._id,
      extra: patient._id,
    });
    await sendOtp(verification.otp, req.user.phoneNumber);
    return res.json({
      message: `Account verification Success.use OTP sent to ${req.user.phoneNumber} to complete your profile creation in the next 5 minutes`,
    });
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});
router.post("/verify", auth, async (req, res) => {
  try {
    const code = req.body.code;
    if (!code)
      throw {
        details: [{ path: ["code"], message: "Please Provide OTP Code" }],
      };
    const verification = await AccountVerification.findOne({
      user: req.user._id,
      verified: false,
      expiry: {
        $gte: moment(),
      },
      otp: String(code),
    });
    if (!verification)
      throw {
        details: [{ path: ["code"], message: "Invalid or Expired code!" }],
      };
    const patient = await Patient.findOne({ _id: verification.extra });
    patient.user = req.user._id;
    await patient.save();
    verification.verified = true;
    await verification.save();
    res.json(
      await patient.populate("user", "_id username email phoneNumber roles")
    );
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});
module.exports = router;
