import mongoose, { Schema } from "mongoose";

class ResolvedSchema extends Schema {
  public objectSchema: any;

  constructor() {
    super();
    this.schema();
  }

  private schema() {
    this.objectSchema = new Schema(
      {
        user: { type: String, index: true },
        betIndex: { type: Number },
        result: { type: Number },
        blockNumber: { type: Number },
        transactionHash: { type: String },
        network: { type: String, default: "" },
      },
      { timestamps: true, strict: false }
    );
  }
}

export default mongoose.model("ResolvedBet", new ResolvedSchema().objectSchema);
