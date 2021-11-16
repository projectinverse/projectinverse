import { Request, Response, Router } from "express";

import * as Interfaces from "interfaces";
import { Responses } from "../../helpers";
import { requestDecrypt } from "../../middlewares";

import Bets from "./bet.model";

class BetsController implements Interfaces.Controller {
  public path = "/bet";
  public router = Router();
  constructor() {
    this.initializeRoutes();
  }

  private async initializeRoutes() {
    this.router
      .all(`${this.path}/*`)
      .post(this.path + "/user", this.getAll)
      .get(this.path + "/ranksmonthly", this.topScorersMonthly)
      .get(this.path + "/ranks", this.topScorers);
  }

  private async getAll(req: any, response: Response) {
    try {
      let { network } = req.query;
      let { isInverse, hide, startTime, address } = req.body;
      const records = await Bets.getAll(
        address.toLowerCase(),
        isInverse,
        hide,
        startTime,
        network
      );
      return Responses.success(response, {
        status: true,
        data: records,
      });
    } catch (error) {
      return Responses.error(response, { message: error });
    }
  }

  private async topScorersMonthly(req: any, response: Response) {
    try {
      let { network } = req.query;
      const records = await Bets.topScorersMonthly(network);

      return Responses.success(response, {
        status: true,
        data: records,
      });
    } catch (error) {
      return Responses.error(response, { message: error });
    }
  }

  private async topScorers(req: any, response: Response) {
    try {
      let { network } = req.query;
      const records = await Bets.topScorers(network);

      return Responses.success(response, {
        status: true,
        data: records,
      });
    } catch (error) {
      return Responses.error(response, { message: error });
    }
  }
}


export default BetsController;
