import mongoose, { Schema } from "mongoose";

class ChangeCoinStatusSchema extends Schema {
  public objectSchema: any;

  constructor() {
    super();
    this.schema();
  }

  private schema() {
    this.objectSchema = new Schema(
      {
        coinAddress: { type: String },
        coinType: { type: Number },
        planType: { type: Number },
        status: { type: Boolean },
        blockNumber: { type: Number },
        transactionHash: { type: String },
        network: { type: String, default: "" },
      },
      { timestamps: false, strict: false }
    );

    this.objectSchema.index({ blockNumber: 1 });
  }
}

export default mongoose.model(
  "CoinStatus",
  new ChangeCoinStatusSchema().objectSchema
);
