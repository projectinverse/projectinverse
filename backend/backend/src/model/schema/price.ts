import mongoose, { Schema } from "mongoose";

class PriceSchema extends Schema {
  public objectSchema: any;

  constructor() {
    super();
    this.schema();
  }

  private schema() {
    this.objectSchema = new Schema(
      {
        address: { type: String, index: true },
        price: { type: Number },
        todayTimestamp: { type: Number, default: 0 },
        network: { type: String, default: "" },
      },
      { timestamps: true, strict: false }
    );
  }
}

export default mongoose.model("Price", new PriceSchema().objectSchema);
