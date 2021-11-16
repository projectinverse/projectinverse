import mongoose, { Schema } from "mongoose";

class BetSchema extends Schema {
  public objectSchema: any;

  constructor() {
    super();
    this.schema();
  }

  private schema() {
    this.objectSchema = new Schema(
      {
        userAddress: { type: String },
        network: { type: String, default: "" },
        paymentTokenAddress: { type: String },
        betTokenAddress: { type: String },
        betIndex: { type: Number },
        endTime: { type: Number },
        startTime: { type: Number },
        betExpired: { type: Boolean, default: false },
        cronStatus: { type: Number, default: 0 },
        result: { type: Boolean, default: false },
        planDays: { type: Number },
        blockNumber: { type: Number },
        transactionHash: { type: String },
        betResolveTx: { type: String },
        error: { type: String, default: "" },
        finalStatus: { type: Boolean, default: false },
        unstakedEarlier: { type: Boolean, default: false },
      },
      { timestamps: false, strict: false }
    );

    this.objectSchema.index({ blockNumber: 1 });
  }
}

export default mongoose.model("Bet", new BetSchema().objectSchema);
