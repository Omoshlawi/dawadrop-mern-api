const { getValidationErrrJson } = require("../../utils/helpers");
const { searchPatient } = require("../api");
const Patient = require("../models/Patient");
const TreatmentSurport = require("../models/TreatmentSurport");
const { profileValidator } = require("../validators");

const verifyPatientAndAddAsCareReceiver = async (req, res) => {
  try {
    // vERIFY PATENT INFO
    const { cccNumber, firstName, upiNo } = await profileValidator(req.body);
    const remotePatient = await searchPatient(cccNumber);
    if (!remotePatient)
      throw Error("Verification Error!\nCCC Number / First Name do not match");
    if (remotePatient.f_name.toLowerCase() !== firstName.toLowerCase())
      throw Error("Verification Error!\nCCC Number / First Name do not match");
    if (upiNo && remotePatient.upi_no !== upiNo)
      throw Error(
        "Verification Error!\nUPI Number / First Name / CCC Number do not match"
      );

    const patient = await Patient.getOrCreatePatientFromRemote(remotePatient);
    if (patient.user.equals(req.user._id)) {
      throw {
        status: 403,
        message: "Invalid Operation.Cant add yourself as careReceiver",
      };
    }
    // Check if asociation exists
    const asociation = await TreatmentSurport.findOne({
      careGiver: req.user._id,
      careReceiver: patient._id,
    });
    if (asociation) {
      asociation.canOrderDrug = true;
      await asociation.save();
      return res.json(await asociation.populate("careGiver careReceiver"));
    }
    // Create asociation
    const tSupport = new TreatmentSurport({
      canOrderDrug: true,
      careGiver: req.user._id,
      careReceiver: patient._id,
      owner: "giver",
    });
    await tSupport.save();
    return res.json(await tSupport.populate("careGiver careReceiver"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

module.exports = { verifyPatientAndAddAsCareReceiver };
