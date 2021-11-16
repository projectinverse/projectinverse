import BaseModel from "../../model/base.model";

const axios = require("axios");

import { Bets, ClaimedBets, Plans } from "../../model/schema";

class Bet extends BaseModel {
  constructor() {
    super();
  }

  /**
   * get all Bets
   * @param userAddress
   */
  public async getAll(
    address: string,
    type: string,
    hide: boolean,
    startTime: number,
    network: string
  ): Promise<any> {
    try {
      let betData: any;
      let query: any = {
        userAddress: address,
        network,
      };
      if (startTime !== null) {
        let currentDate: any = Math.floor(startTime / 86400);
        currentDate = currentDate * 86400;
        const endDate = currentDate + 86400;
        query.startTime = { $gte: currentDate, $lt: endDate };
      }
      let arr: any = [
        { $eq: ["$betIndex", "$$betIndex"] },
        { $eq: ["$isInverse", "$$isInverse"] },
        { $eq: ["$userAddress", "$$userAddress"] },
        { $eq: ["$status", 0] },
      ];
      if (!hide) {
        arr = [
          { $eq: ["$betIndex", "$$betIndex"] },
          { $eq: ["$isInverse", "$$isInverse"] },
          { $eq: ["$userAddress", "$$userAddress"] },
        ];
      }

      const claimedAmount = await ClaimedBets.aggregate([
        {
          $match: {
            winningAmount: { $ne: "0" },
            user: address,
            network,
          },
        },
        {
          $group: {
            _id: {
              user: "$user",
            },
            totalSaleAmount: {
              $sum: { $toDouble: "$winningAmount" },
            },
          },
        },
      ]);

      const result: any = await Plans.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$userAddress",
            totalSaleAmount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$isInverse", type] },
                      { $eq: ["$isClaimed", false] },
                      { $ne: ["$status", 3] },
                    ],
                  },
                  { $toDouble: "$stakedInXIV" },
                  0,
                ],
              },
            },
          },
        },
      ]);

      betData = await Bets.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "changes",
            localField: "betTokenAddress",
            foreignField: "address",
            as: "changedata",
          },
        },

        {
          $lookup: {
            from: "plans",
            let: {
              betIndex: "$betIndex",
              isInverse: type,
              userAddress: address,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: arr,
                  },
                },
              },

              {
                $project: {
                  _id: 0,
                  amount: 1,
                  stakedInXIV: 1,
                  initialPrice: 1,
                  finalPrice: 1,
                  priceInXIV: 1,
                  reward: 1,
                  dropValue: 1,
                  risk: 1,
                  status: 1,
                  planType: 1,
                  isInToken: 1,
                  isInverse: 1,
                  isClaimed: 1,
                },
              },
              { $sort: { createdAt: -1 } },
            ],
            as: "plandata",
          },
        },

        { $match: { plandata: { $ne: [] } } },

        {
          $lookup: {
            from: "coins",
            let: { betCoinaddress: "$betTokenAddress" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$address", "$$betCoinaddress"] },
                },
              },

              {
                $project: {
                  logo: 1,
                  _id: 0,
                  symbol: 1,
                },
              },
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
            ],
            as: "coinLogo",
          },
        },
        { $unwind: { path: "$coinLogo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            paymentTokenAddress: 1,
            betTokenAddress: 1,
            endTime: 1,
            betIndex: 1,
            startTime: 1,
            plandata: 1,
            coinLogo: 1,
            planDays: 1,
            currentPrice: { $arrayElemAt: ["$changedata.currentPrice", 0] },
            changeFromStake: {
              $divide: [
                {
                  $multiply: [
                    {
                      $subtract: [
                        { $arrayElemAt: ["$changedata.currentPrice", 0] },
                        { $arrayElemAt: ["$plandata.initialPrice", 0] },
                      ],
                    },
                    100,
                  ],
                },
                { $arrayElemAt: ["$plandata.initialPrice", 0] },
              ],
            },
          },
        },
        { $sort: { startTime: -1 } },
      ]);

      return { betData, claimedAmount, result };
    } catch (error) {
      console.log(error);
    }
  }

  public async topScorersMonthly(network: string) {
    try {
      let currentMonth: any = Math.floor(Date.now() / 1000);
      let nextMonth = currentMonth - 86400 * 30;

      const monthlyScorers = await ClaimedBets.aggregate([
        {
          $match: {
            winningAmount: { $ne: "0" },
            timeOfClaim: { $gte: nextMonth, $lt: currentMonth },
            network,
          },
        },
        {
          $group: {
            _id: {
              user: "$user",
            },
            totalSaleAmount: {
              $sum: { $toDouble: "$winningAmount" },
            },
          },
        },
        { $sort: { totalSaleAmount: -1 } },
        { $limit: 40 },
      ]);
      return monthlyScorers;
    } catch (error) {
      console.log(error);
    }
  }

  public async topScorers(network: string) {
    try {
      const overallScorers = await ClaimedBets.aggregate([
        {
          $match: {
            winningAmount: { $ne: "0" },
            network,
          },
        },
        {
          $group: {
            _id: {
              user: "$user",
            },
            totalSaleAmount: {
              $sum: { $toDouble: "$winningAmount" },
            },
          },
        },
        { $sort: { totalSaleAmount: -1 } },
        { $limit: 40 },
      ]);
      return overallScorers;
    } catch (error) {
      console.log(error);
    }
  }
}

export default new Bet();
