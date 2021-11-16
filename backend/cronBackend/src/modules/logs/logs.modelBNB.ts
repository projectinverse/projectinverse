import BaseModel from "../../model/base.model";

import Web3 from "web3";

import {
  ClaimedBet,
  Coins,
  Prices,
  Bets,
  Plans,
  ChangeStatus,
  Penalty,
  Change,
  EventBlocknumber,
} from "../../model/schema";

const axios = require("axios");

// const HDWalletProvider = require("@truffle/hdwallet-provider");

const mainContract = require("../../bin/mainContractABI.json");
const tokenContract = require("../../bin/tokenContract.json");
const oracleContract = require("../../bin/oracleWrapperContractABI.json");

// set provider for all later instances to use
// Contract.setProvider("ws://localhost:8545");
class Logs extends BaseModel {
  private BINANCE_RPC = process.env.BINANCE_RPC!;
  private web3Obj: any;
  private myContractOb: any;
  private myTokenContractOb: any;
  private oracleObj: any;
  private XIV_ADDRESS_BNB = process.env.XIV_ADDRESS_BNB!;
  private contractAddressBNB = process.env.CONTRACT_ADDRESS_BNB;
  private blockNumberBNB = process.env.BLOCK_NUMBER_BNB!;
  private crypto_API_KEY = process.env.CRYPTO_COMPARE!;
  private headers: any;
  private method = "get";
  private oracleAddressBNB = process.env.ORACLE_CONTRACT_ADDRESS_BNB!;
  private usdtBNB = process.env.USDT_ADDRESS_BNB!;
  private blockDifference = 200;
  // private defaultAddress = process.env.DEFAULT_ADDRESS!;

  //    event (address user, uint256 time, uint256 investmentAmount, uint8 planType);
  private eventsArr = [
    "Addcoins",
    "NewBet",
    "CoinStatus",
    "UserPenalized",
    "BetClaimed",
  ];

  constructor() {
    super();

    this.web3Obj = new Web3(this.BINANCE_RPC);
    this.myContractOb = new this.web3Obj.eth.Contract(
      mainContract,
      this.contractAddressBNB
    );

    this.oracleObj = new this.web3Obj.eth.Contract(
      oracleContract,
      this.oracleAddressBNB
    );

    this.headers = {
      "Content-Type": "application/json",
    };
  }
  /**
   * get Mongoose schema obj
   * @param  {string} d
   * @returns Promise
   */
  private async getMongooseObject(d: string): Promise<any> {
    switch (d) {
      case "Addcoins":
        return Coins;
      case "NewBet":
        return Bets;
      case "CoinStatus":
        return ChangeStatus;
      case "UserPenalized":
        return Penalty;
      case "BetClaimed":
        return ClaimedBet;
    }
  }
  /**
   * filter array object properties
   * @param  {any} obj
   * @param  {string} eventName
   */
  private async filterObjectValues(obj: any, eventName: string) {
    let returnValues: any = Object.create({});

    returnValues.transactionHash = obj.transactionHash;
    returnValues.blockNumber = obj.blockNumber;
    returnValues.network = "BNB";

    switch (eventName) {
      case "Addcoins":
        const symbol = await this.getSymbol(
          obj.returnValues.coinAddress.toLowerCase()
        );
        const logo = await this.getLogo(symbol);
        returnValues.coinType = obj.returnValues.coinType;
        returnValues.planType = obj.returnValues.planType;
        returnValues.address = obj.returnValues.coinAddress.toLowerCase();
        returnValues.status = obj.returnValues.status;
        returnValues.symbol = symbol;
        returnValues.logo = logo;
        break;

      case "NewBet":
        returnValues.userAddress = obj.returnValues.user.toLowerCase();
        returnValues.paymentTokenAddress =
          obj.returnValues.betCoin.toLowerCase();
        returnValues.betTokenAddress =
          obj.returnValues.coinAddress.toLowerCase();
        returnValues.endTime = obj.returnValues.endTime;
        returnValues.betIndex = obj.returnValues.betIndex;
        returnValues.startTime = obj.returnValues.startTime;
        returnValues.planDays = obj.returnValues.planDays;

        break;
      case "CoinStatus":
        returnValues.coinAddress = obj.returnValues.coinAddress.toLowerCase();
        returnValues.coinType = obj.returnValues.coinType;
        returnValues.planType = obj.returnValues.planType;
        returnValues.status = obj.returnValues.status;

        break;

      case "UserPenalized":
        returnValues.user = obj.returnValues.user.toLowerCase();
        returnValues.betIndex = obj.returnValues.betIndex;
        returnValues.isClaimed = obj.returnValues.isClaimed;

        break;
      case "BetClaimed":
        returnValues.user = obj.returnValues.user.toLowerCase();
        returnValues.betIndex = obj.returnValues.betIndex;
        returnValues.timeOfClaim = obj.returnValues.timeOfClaim;
        returnValues.winningAmount = obj.returnValues.winningAmount;

        break;
    }

    return returnValues;
  }
  /**
   * @param  {any} n
   * @param  {string} eventName
   * @param  {number} blockNumber
   * @returns Promise
   */
  private async getCronLogs(
    eventName: string,
    blockNumber: number
  ): Promise<any> {
    try {
      const event = await this.myContractOb.getPastEvents(eventName, {
        fromBlock: blockNumber,
        toBlock: blockNumber + this.blockDifference,
      });

      // console.log("Event: Line no 135=========", event.length, eventName);
      if (event.length > 0) {
        let r = await event.map(
          async (d: any) => await this.filterObjectValues(d, eventName)
        );
        r = await Promise.all(r);
        return r;
      }
      return [];
    } catch (error) {
      console.log(error);
    }
  }
  /** call delete function
   * @param  {string} d
   */
  private async callingDelete(d: string) {
    let query: any = [];
    console.log("inside calling delete", d);

    switch (d) {
      case "Addcoins":
      case "CoinStatus":
        console.log("Inside query");
        query = [
          {
            $group: {
              _id: {
                transactionHash: "$transactionHash",
                network: "$network",
                coinType: "$coinType",
                planType: "$planType",
              },
              dups: { $addToSet: "$_id" },
              count: { $sum: 1 },
            },
          },
          { $match: { count: { $gt: 1 } } },
        ];

        console.log(
          `BNB ///////////////////////////////////////////////////////////////// ${d} `
        );
        break;
      case "UserPenalized":
      case "BetClaimed":
        query = [
          {
            $group: {
              _id: {
                transactionHash: "$transactionHash",
                network: "$network",
                user: "$user",
                betIndex: "$betIndex",
              },
              dups: { $addToSet: "$_id" },
              count: { $sum: 1 },
            },
          },
          { $match: { count: { $gt: 1 } } },
        ];
        console.log(
          `BNB ///////////////////////////////////////////////////////////////// ${d} `
        );
        break;
      case "NewBet":
        query = [
          {
            $group: {
              _id: {
                transactionHash: "$transactionHash",
                network: "$network",
                userAddress: "$userAddress",
                betIndex: "$betIndex",
              },
              dups: { $addToSet: "$_id" },
              count: { $sum: 1 },
            },
          },
          { $match: { count: { $gt: 1 } } },
        ];
        console.log(
          `BNB ///////////////////////////////////////////////////////////////// ${d} `
        );
        break;
    }
    console.log(query.length, "before");
    if (query.length > 0) {
      const ob = await this.getMongooseObject(d);
      ob.aggregate(query)
        .then((result: any) => {
          if (result.length > 0) {
            result.forEach(async (doc: any) => {
              doc.dups.shift();
              await ob.deleteMany({ _id: { $in: doc.dups } });
            });
          }
        })
        .catch(console.log);
    }
  }
  /**
   * @param  {string} d
   * @param  {any} data
   * @returns Promise
   */
  private async addData(d: string, data: any): Promise<any> {
    const ob = await this.getMongooseObject(d);
    const response = await ob.insertMany(data);
    if (response && d === "Addcoins") {
      this.initiateChange(response);
      this.fetchPrice(response);
    } else if (response && d === "NewBet") {
      this.getPlans(response);
    } else if (response && d === "CoinStatus") {
      this.changeStatus(response);
    } else if (response && d === "UserPenalized") {
      this.unstake(response);
    } else if (response && d === "BetClaimed") {
      this.updateClaim(response);
    }

    return response;
  }
  /**
   * @param  {string} d
   * @returns Promise
   */
  private async appendLogs(eventName: string): Promise<any> {
    let blockNumber: number = 0;
    const eventBlockNumber = await this.getEventBlocknumber(eventName);

    if (!eventBlockNumber) {
      await this.addEventBlocknumber(eventName, Number(this.blockNumberBNB));
      blockNumber = Number(this.blockNumberBNB);
      return;
    }

    blockNumber = eventBlockNumber;
    let event = await this.getCronLogs(eventName, blockNumber);

    const lastestBlock = await this.web3Obj.eth.getBlockNumber();
    let logsBlock = eventBlockNumber + this.blockDifference;

    if (event && event.length >= 1 && blockNumber === event[0].blockNumber) {
      event = event.slice(1);
    }

    if (event && event.length === 0) {
      if (logsBlock >= lastestBlock) {
        logsBlock = lastestBlock;
      }
      await this.addEventBlocknumber(eventName, logsBlock);
      return;
    }

    if (event && event?.length > 0) {
      console.log(`${eventName}`, event?.length, "Found");
      const b = event[event.length - 1].blockNumber;
      await this.addEventBlocknumber(eventName, b + 1);
      await this.addData(eventName, event);
      console.log("Deleting Duplicate logs-------------------");
      await this.callingDelete(eventName);
      console.log("Deleted Duplicate logs++++++++++++++++++++++");

      return;
    }
    return;
  }

  private async addEventBlocknumber(eventName: string, blockNumber: number) {
    await EventBlocknumber.updateOne(
      { eventName },
      { $set: { eventName, blockNumber } },
      { upsert: true }
    );
  }

  private async getEventBlocknumber(eventName: string) {
    const result: any = await EventBlocknumber.findOne({ eventName });
    return result?.blockNumber;
  }

  /**
   * get new logs
   */
  public async addNewUserLog() {
    try {
      console.log("--run log direct from the app--");

      this.eventsArr.map(async (d) => {
        console.log(d);
        await this.appendLogs(d);
      });
    } catch (error) {
      console.log(error);
    }
  }

  public async updateClaim(data: any) {
    try {
      for (let d of data) {
        const result: any = await Plans.findOne({
          userAddress: d.user.toLowerCase(),
          betIndex: d.betIndex,
          network: "BNB",
        });

        if (result) {
          result.isClaimed = true;

          await result.save();
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  public async updatePrice() {
    try {
      const response = await Coins.find({ network: "BNB" }).select([
        "symbol",
        "address",
      ]);
      if (response && response.length > 0) {
        this.fetchPrice(response);
      }
    } catch (error) {
      console.log(error);
    }
    this.deleteOldLogs();
  }

  private async deleteOldLogs() {
    try {
      let date: any = new Date().getTime();
      const thirtyDays = 3600 * 24 * 30 * 1000;
      const difference: any = new Date(date - thirtyDays);
      const response: any = await Prices.deleteMany({
        createdAt: { $lte: difference },
        network: "BNB",
      });
    } catch (error) {
      console.log(error);
    }
  }

  public async initiateChange(data: any) {
    try {
      for (let d of data) {
        const result: any = await Change.findOne({
          address: d.address.toLowerCase(),
          network: "BNB",
        });

        if (!result) {
          const price = await this.getPrice(d.address);
          if (price) {
            const result = await axios({
              method: this.method,
              url: `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${d.symbol}&tsyms=USD&api_key=${this.crypto_API_KEY}`,
              headers: this.headers,
            });

            let response = result.data.RAW[`${d.symbol}`].USD.CHANGEPCT24HOUR;
            let data: any = {};
            data.address = d.address.toLowerCase();
            data.symbol = d.symbol;
            data.status = d.status;
            data.currentPrice = price;
            data.change = response;
            data.network = "BNB";

            const a = new Change(data);
            await a.save();
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  public async updateChange() {
    try {
      const data: any = await Change.find({ network: "BNB" });
      if (data.length > 0) {
        console.log(
          data,
          "coinstatus update::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::BNB"
        );
        for (let d of data) {
          const currentPrice = await this.getPrice(d.address);
          if (currentPrice) {
            const result = await axios({
              method: this.method,
              url: `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${d.symbol}&tsyms=USD&api_key=${this.crypto_API_KEY}`,
              headers: this.headers,
            });

            let response = result.data.RAW[`${d.symbol}`].USD.CHANGEPCT24HOUR;
            d.currentPrice = currentPrice;
            d.change = response;
            const r = await d.save();
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @param  {any} data
   * @returns Promise
   */
  private async changeStatus(data: any): Promise<any> {
    try {
      for (let d of data) {
        console.log(d, "------------------------------------------------");
        const result: any = await Coins.findOne({
          address: d.coinAddress.toLowerCase(),
          coinType: d.coinType,
          planType: d.planType,
          network: "BNB",
        });
        const changeOfCoin: any = await Change.findOne({
          address: d.coinAddress.toLowerCase(),
          network: "BNB",
        });

        if (result) {
          result.status = d.status;
          await result.save();
          if (changeOfCoin) {
            changeOfCoin.status = d.status;
            await changeOfCoin.save();
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async unstake(data: any): Promise<any> {
    try {
      for (let d of data) {
        const bet: any = await Bets.findOne({
          userAddress: d.user.toLowerCase(),
          betIndex: d.betIndex,
          network: "BNB",
        });
        const plan: any = await Plans.findOne({
          userAddress: d.user.toLowerCase(),
          betIndex: d.betIndex,
          network: "BNB",
        });

        if (bet && plan) {
          const price = await this.getPrice(bet.betTokenAddress);
          if (price) {
            bet.unstakedEarlier = true;
            plan.status = 3;
            plan.finalPrice = price;
            await bet.save();
            await plan.save();
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async getLogo(sym: String) {
    try {
      sym = sym.toUpperCase();
      let result: any = await axios({
        method: this.method,
        url: `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${sym}&tsyms=USD&api_key=${this.crypto_API_KEY}`,
        headers: this.headers,
      });

      result = result.data.RAW[`${sym}`].USD.IMAGEURL;
      result = `https://www.cryptocompare.com${result}`;
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  private async getPrice(address: any) {
    try {
      const price = await this.oracleObj.methods
        .getPrice(address, this.usdtBNB)
        .call();
      return price;
    } catch (error) {
      console.log(
        error,
        "-------------------------Coin is not in Oracle BNB--------------"
      );
      return false;
    }
  }

  private async getSymbol(address: String) {
    try {
      if (address === "0x0000000000000000000000000000000000000001") {
        return "BNB";
      } else {
        this.myTokenContractOb = new this.web3Obj.eth.Contract(
          tokenContract,
          address
        );
        const symbol = await this.myTokenContractOb.methods.symbol().call();
        return symbol;
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async fetchPrice(data: any) {
    let currentDate: any = Math.floor(Date.now() / 86400000);

    currentDate = currentDate * 86400;

    try {
      for (let elem of data) {
        let price = await this.getPrice(elem.address);
        if (price) {
          const dd = {
            address: elem.address.toLowerCase(),
            price,
            todayTimestamp: currentDate,
          };
          const coinDetails = await Prices.updateMany(
            {
              address: elem.address.toLowerCase(),
              network: "BNB",
              todayTimestamp: { $gte: currentDate },
            },
            {
              $set: dd,
            },
            {
              upsert: true,
            }
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async getPlans(data: any) {
    try {
      for (let elem of data) {
        let amountInXIV;
        let response: any = Object.create({});
        const previousResults = await Plans.findOne({
          userAddress: elem.userAddress.toLowerCase(),
          betIndex: elem.betIndex,
          network: "BNB",
        });

        if (!previousResults) {
          const planDetails1 = await this.myContractOb.methods
            .userBetsOne(elem.userAddress, elem.betIndex)
            .call();
          const planDetails2 = await this.myContractOb.methods
            .userBetsTwo(elem.userAddress, elem.betIndex)
            .call();

          response.userAddress = elem.userAddress.toLowerCase();
          response.betIndex = elem.betIndex;

          if (
            elem.paymentTokenAddress.toLowerCase() ===
            this.XIV_ADDRESS_BNB.toLowerCase()
          ) {
            amountInXIV = planDetails1.amount;
          } else {
            let decimal;
            if (
              elem.paymentTokenAddress ===
              "0x0000000000000000000000000000000000000001"
            ) {
              //BNB
              decimal = 18;
            } else {
              this.myTokenContractOb = new this.web3Obj.eth.Contract(
                tokenContract,
                elem.paymentTokenAddress
              );
              decimal = await this.myTokenContractOb.methods.decimals().call();
            }

            amountInXIV = await this.myContractOb.methods
              .getPriceInXIV(elem.paymentTokenAddress)
              .call();

            amountInXIV = (amountInXIV * planDetails1.amount) / 10 ** decimal;
          }
          response.amount = planDetails1.amount;
          response.stakedInXIV = amountInXIV;

          response.initialPrice = await this.getPrice(elem.betTokenAddress);
          response.priceInXIV = planDetails1.priceInXIV;
          response.network = "BNB";
          response.reward = planDetails2.reward;
          response.dropValue = planDetails2.dropValue;
          response.risk = planDetails2.risk;
          response.status = planDetails1.status;
          response.planType = planDetails2.planType;
          response.isInToken = planDetails2.isInToken;
          response.isInverse = planDetails1.isInverse;
          response.isClaimed = planDetails2.isClaimed;
          response = new Plans(response);
          await response.save();
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default new Logs();
