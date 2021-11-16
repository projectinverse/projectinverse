import mongoose, { Schema } from "mongoose";

class PenaltySchema extends Schema {
  public objectSchema: any;

  constructor() {
    super();
    this.schema();
  }

  private schema() {
    this.objectSchema = new Schema(
      {
        user: { type: String },
        betIndex: { type: Number },
        isClaimed: { type: Boolean },
        blockNumber: { type: Number },
        transactionHash: { type: String },
        network: { type: String, default: "" },
      },
      { timestamps: false, strict: false }
    );

    this.objectSchema.index({ blockNumber: 1 });
  }
}

export default mongoose.model("Penalty", new PenaltySchema().objectSchema);
