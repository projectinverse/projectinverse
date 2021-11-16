import mongoose, { Schema } from "mongoose";

class Change extends Schema {
  public objectSchema: any;

  constructor() {
    super();
    this.schema();
  }

  private schema() {
    this.objectSchema = new Schema(
      {
        address: { type: String },
        network: { type: String, default: "" },
        currentPrice: { type: Number },
        symbol: { type: String },
        change: { type: Number },
        status: { type: Boolean },
      },
      { timestamps: true, strict: false }
    );

    this.objectSchema.index({ blockNumber: 1 });
  }
}

export default mongoose.model("Change", new Change().objectSchema);
