import BaseModel from "../../model/base.model";

import Web3 from "web3";
import { Bets } from "../../model/schema";
import { Plans } from "../../model/schema";
import { ResolvedBets } from "../../model/schema";

const mainContract = require("../../bin/mainContractABI.json");
const oracleContract = require("../../bin/oracleWrapperContractABI.json");

class ResolveBet extends BaseModel {
  private INFURA_API = process.env.INFURA_API!;
  private web3Obj: any;
  private myContractOb: any;
  private myTokenContractOb: any;
  private oracleObj: any;
  private contractAddressETH = process.env.CONTRACT_ADDRESS_ETH;
  private blockNumberETH = process.env.BLOCK_NUMBER_ETH!;
  private managerAddress = process.env.MANAGER_ADDRESS!;
  private privateKeyManager = process.env.PRIVATE_KEY_MANAGER!;
  private oracleAddressETH = process.env.ORACLE_CONTRACT_ADDRESS_ETH!;
  private usdtETH = process.env.USDT_ADDRESS_ETH!;

  private eventsArr = ["BetResolved"];
  constructor() {
    super();

    this.web3Obj = new Web3(this.INFURA_API);
    this.myContractOb = new this.web3Obj.eth.Contract(
      mainContract,
      this.contractAddressETH
    );

    this.oracleObj = new this.web3Obj.eth.Contract(
      oracleContract,
      this.oracleAddressETH
    );
  }
  /**
   * get Mongoose schema obj
   * @param  {string} d
   * @returns Promise
   */
  private async getMongooseObject(d: string): Promise<any> {
    switch (d) {
      case "BetResolved":
        return ResolvedBets;
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
    returnValues.network = "ETH";

    switch (eventName) {
      case "BetResolved":
        returnValues.user = obj.returnValues.user.toLowerCase();
        returnValues.betIndex = obj.returnValues.index;
        returnValues.result = obj.returnValues.result;

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
        // Using an array means OR: e.g. 20 or 23
        fromBlock: blockNumber,
        // toBlock: 'latest'
      });

      console.log("Event =========", event.length, eventName);

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

  /**
   * @param  {string} d
   * @param  {any} data
   * @returns Promise
   */
  private async addData(d: string, data: any): Promise<any> {
    const ob = await this.getMongooseObject(d);
    const response = await ob.insertMany(data);
    if (response) {
      this.updateStatus(response);
    }

    return response;
  }

  /**
   * get last record
   * @param  {string} d
   * @returns Promise
   */
  private async getData(d: string): Promise<any> {
    const ob = await this.getMongooseObject(d);

    return ob.findOne({ network: "ETH" }).sort({ blockNumber: -1 });
  }

  private async updateStatus(data: any): Promise<any> {
    try {
      for (let d of data) {
        const result: any = await Plans.findOne({
          userAddress: d.user,
          betIndex: d.betIndex,
          network: "ETH",
        });

        if (result) {
          result.status = d.result;
          await result.save();
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * delete the duplicates
   * @param  {string} d
   */
  private async callingDelete(d: string) {
    let query: any = [];

    switch (d) {
      case "BetResolved":
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
        break;
    }

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
   * @returns Promise
   */
  private async appendLogs(d: string): Promise<any> {
    const logs: any = await this.getData(d);
    const blockNumber: number = logs
      ? logs.blockNumber
      : parseInt(this.blockNumberETH);

    let event = await this.getCronLogs(d, blockNumber);
    if (logs) {
      event = event.slice(1);
    }

    console.log(event.length);

    if (event && event.length > 0) {
      console.log(`${d}`, event.length, "not found");
      await this.addData(d, event);
      await this.callingDelete(d);
      return;
    }
    return;
  }

  /**
   * get new logs
   */
  public async addResolvedBetLogs() {
    try {
      this.eventsArr.map(async (d) => {
        console.log(d);
        await this.appendLogs(d);
      });
    } catch (error) {
      console.log(error);
    }
  }

  private async getPrice(address: any) {
    try {
      const price = await this.oracleObj.methods
        .getPrice(address, this.usdtETH)
        .call();
      return price;
    } catch (error) {
      console.log(
        error,
        "-------------------------Coin is not in Oracle ETH--------------"
      );
      return false;
    }
  }

  public async prepareResolve() {
    try {
      let currentDate: any = Math.floor(Date.now() / 1000) - 60;
      console.log(
        "------------------------Preparing Resolve ETH----------------------"
      );
      await Bets.updateMany(
        {
          endTime: { $lte: currentDate },
          unstakedEarlier: false,
          network: "ETH",
        },
        {
          $set: { betExpired: true },
        }
      );
    } catch (error) {
      console.log(
        "----------------------Prepare Resolve Error ETH-----------------------"
      );
      console.log(error);
    }
  }
  /**
   */
  public async resolvingBet() {
    try {
      console.log(
        "------------------Resolving with first cron ETH------------------------"
      );
      let address = [];
      let betIndex = [];
      let data: any = await Bets.find({
        betExpired: true,
        cronStatus: 0,
        unstakedEarlier: false,
        network: "ETH",
      }).limit(500);

      for (let d of data) {
        address.push(d.userAddress);
        betIndex.push(d.betIndex);
      }
      if (betIndex.length > 0) {
        const result = await this.resolveBet(betIndex, address, true);

        for (let d of data) {
          if (result.status === true) {
            const price = await this.getPrice(d.betTokenAddress);
            if (price) {
              d.betResolveTx = result.tx;
              d.finalStatus = true;
              d.cronStatus = 1;
              const plan: any = await Plans.findOne({
                userAddress: d.userAddress,
                betIndex: d.betIndex,
                network: "ETH",
              });

              plan.finalPrice = price;
              await plan.save();
            }
          } else {
            d.error = result.error;
            d.finalStatus = false;
            d.cronStatus = 2;
          }

          await d.save();
        }
      }
    } catch (error) {
      console.log(
        "-----------------------------------First Cron Error ETH-------------------"
      );

      console.log(error);
    }
  }

  public async finalCron() {
    try {
      let data: any = await Bets.findOne({
        error: { $ne: "" },
        finalStatus: false,
        cronStatus: 2,
        unstakedEarlier: false,
        network: "ETH",
      });
      console.log("-----------------Final cron ETH------------------");
      if (data) {
        const result = await this.resolveBet(
          [data.betIndex],
          [data.userAddress],
          false
        );

        data.finalStatus = true;
        data.cronStatus = 2;

        await data.save();
        const plan: any = await Plans.findOne({
          userAddress: data.userAddress,
          betIndex: data.betIndex,
          network: "ETH",
        });
        const price = await this.getPrice(data.betTokenAddress);
        if (price) {
          plan.finalPrice = price;
          await plan.save();
        }
      }
    } catch (error) {
      console.log(
        "-----------------------------------Final Cron Error ETH-------------------"
      );

      console.log(error);
    }
  }

  private async getBlockchainNonce(
    address: string,
    pending = true
  ): Promise<number> {
    let nonce;
    if (pending) {
      nonce = await this.web3Obj.eth.getTransactionCount(address, "pending");
    } else {
      nonce = await this.web3Obj.eth.getTransactionCount(address);
    }
    return nonce;
  }

  public async resolveBet(betIndex: any, address: any, checkTime: boolean) {
    try {
      this.myTokenContractOb = new this.web3Obj.eth.Contract(
        mainContract,
        this.contractAddressETH
      );
      const encodeData = await this.myTokenContractOb.methods
        .resolveBet(betIndex, address, checkTime)
        .encodeABI();
      const gasPrice = await this.web3Obj.eth.getGasPrice();
      const nonceVal = await this.getBlockchainNonce(this.managerAddress);

      const gas = await this.myTokenContractOb.methods
        .resolveBet(betIndex, address, checkTime)
        .estimateGas({ from: this.managerAddress, value: 0 });
      const tx = {
        to: this.contractAddressETH,
        data: encodeData,
        gasPrice: gasPrice,
        gas,
        value: 0,
        nonce: nonceVal,
      };
      const result: any = await this.web3Obj.eth.accounts.signTransaction(
        tx,
        this.privateKeyManager
      );
      const r = await this.web3Obj.eth.sendSignedTransaction(
        result.rawTransaction
      );
      console.log(
        r,
        "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++Resolving Bet success ETH"
      );
      return { status: true, tx: r.transactionHash };
    } catch (error) {
      console.log(
        error,
        "------------------Resolve Contract Error ETH--------------"
      );
      return { status: false, error: error };
    }
  }
}

export default new ResolveBet();
