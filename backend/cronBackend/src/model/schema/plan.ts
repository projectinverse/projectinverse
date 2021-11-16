import mongoose, { Schema } from "mongoose";

class PlanSchema extends Schema {
  public objectSchema: any;

  constructor() {
    super();
    this.schema();
  }

  private schema() {
    this.objectSchema = new Schema(
      {
        userAddress: { type: String },
        amount: { type: String },
        stakedInXIV: { type: String },
        initialPrice: { type: Number, default: 0 },
        finalPrice: { type: Number, default: 0 },
        currentPrice: { type: String },
        priceInXIV: { type: String },
        reward: { type: Number },
        dropValue: { type: Number },
        risk: { type: Number },
        status: { type: Number },
        planType: { type: Number },
        isInverse: { type: Boolean },
        isInToken: { type: Boolean },
        isClaimed: { type: Boolean },
        betIndex: { type: Number },
        blockNumber: { type: Number },
        transactionHash: { type: String },
        network: { type: String, default: "" },
      },
      { timestamps: false, strict: false }
    );

    this.objectSchema.index({ blockNumber: 1 });
  }
}

export default mongoose.model("Plan", new PlanSchema().objectSchema);
