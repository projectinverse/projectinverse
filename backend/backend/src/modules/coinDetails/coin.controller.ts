import { Request, Response, Router } from "express";

import * as Interfaces from "interfaces";
import { Responses } from "../../helpers";

import Coins from "./coin.model";

class CoinsController implements Interfaces.Controller {
  public path = "/coin";
  public router = Router();
  constructor() {
    this.initializeRoutes();
  }

  private async initializeRoutes() {
    this.router.all(`${this.path}/*`).post(this.path + "/getAll", this.getAll);
  }

  //Get Coins

  private async getAll(req: any, response: Response) {
    try {
      const { coinType, planType } = req.body;
      let { network } = req.query;

      if (
        (coinType && (coinType == 1 || coinType == 2 || coinType == 3)) ||
        (planType && (planType == 1 || planType == 2)) ||
        (!planType && !coinType)
      ) {
        const records: any = await Coins.getAll(coinType, planType, network);
        return Responses.success(response, {
          status: true,
          data: records,
        });
      } else {
        return Responses.error(response, {
          status: false,
          data: [],
          error: "No such coin type",
        });
      }
    } catch (error) {
      return Responses.error(response, { message: error });
    }
  }
}

export default CoinsController;
