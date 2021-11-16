import mongoose, { Schema } from "mongoose";

class CoinSchema extends Schema {
  public objectSchema: any;

  constructor() {
    super();
    this.schema();
  }

  private schema() {
    this.objectSchema = new Schema(
      {
        coinType: { type: Number },
        planType: { type: Number },
        address: { type: String },
        logo: { type: String },
        status: { type: Boolean },
        symbol: { type: String },
        blockNumber: { type: Number },
        transactionHash: { type: String },
        network: { type: String, default: "" },
      },
      { timestamps: false, strict: false }
    );

    this.objectSchema.index({ blockNumber: 1 });
  }
}

export default mongoose.model("Coin", new CoinSchema().objectSchema);
