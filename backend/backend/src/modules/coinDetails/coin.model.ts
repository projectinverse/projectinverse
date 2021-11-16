import BaseModel from "../../model/base.model";
import { Coins } from "../../model/schema";

class Coin extends BaseModel {
  constructor() {
    super();
  }

  /**
   * get all Coinss
   * @param userAddress
   */
  public async getAll(
    coinType: string,
    planType: string,
    network: string
  ): Promise<any> {
    try {
      let coinData: any;
      let query: any = {
        status: true,
        network,
      };

      if (coinType) {
        query.coinType = coinType;
      }

      if (planType) {
        query.planType = planType;
      }

      coinData = await Coins.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "changes",
            localField: "address",
            foreignField: "address",
            as: "changedata",
          },
        },
        {
          $lookup: {
            from: "prices",
            let: { address: "$address" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$address", "$address"] },
                },
              },
              {
                $project: {
                  _id: 0,
                  address: 1,
                  price: 1,
                  createdAt: 1,
                },
              },
              { $sort: { createdAt: -1 } },
            ],
            as: "previousPrices",
          },
        },

        {
          $project: {
            coinType: 1,
            planType: 1,
            address: 1,
            status: 1,
            symbol: 1,
            logo: 1,
            previousPrices: 1,
            freshPrice: { $arrayElemAt: ["$changedata.currentPrice", 0] },
            change24: { $arrayElemAt: ["$changedata.change", 0] },
          },
        },
      ]);

      return coinData;
    } catch (error) {
      console.log(error);
    }
  }
}

export default new Coin();
