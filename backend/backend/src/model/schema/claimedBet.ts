import mongoose, { Schema } from "mongoose";

class ClaimedBetSchema extends Schema {
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
        timeOfClaim: { type: Number },
        winningAmount: { type: String },
        network: { type: String, default: "" },
        blockNumber: { type: Number },
        transactionHash: { type: String },
      },
      { timestamps: false, strict: false }
    );

    this.objectSchema.index({ blockNumber: 1 });
  }
}

export default mongoose.model(
  "ClaimedBet",
  new ClaimedBetSchema().objectSchema
);
