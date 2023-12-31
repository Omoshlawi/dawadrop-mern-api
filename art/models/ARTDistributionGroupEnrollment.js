const { model, Schema, Types } = require("mongoose");
const ARTDistributionGroup = require("./ARTDistributionGroup");

const ARTDistributionGroupEnrollment = model(
  "ARTDistributionGroupEnrollment",
  new Schema({
    group: {
      type: ARTDistributionGroup.schema,
      required: true,
    },
    patient: {
      type: Types.ObjectId,
      ref: "Patient",
    },
    publicName: {
      type: String,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
  })
);

module.exports = ARTDistributionGroupEnrollment;
