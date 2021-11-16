import mongoose, { Schema } from "mongoose";

class EventSchema extends Schema {
  public objectSchema: any;

  constructor() {
    super();
    this.schema();
  }

  private schema() {
    this.objectSchema = new Schema(
      {
        eventName: { type: String },
        blockNumber: { type: Number },
        transactionHash: { type: String },
      },
      { timestamps: false, strict: false }
    );

    this.objectSchema.index({ blockNumber: 1 });
  }
}

export default mongoose.model(
  "event_blocknumber",
  new EventSchema().objectSchema
);
