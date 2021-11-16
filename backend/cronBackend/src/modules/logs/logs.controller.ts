import { Request, Response, Router } from "express";

import * as Interfaces from "interfaces";

class LogsController implements Interfaces.Controller {
  public path = "/Logs";
  public router = Router();
  constructor() {
    this.initializeRoutes();
  }

  private async initializeRoutes() {
    this.router.all(`${this.path}/*`);
  }
}

export default LogsController;
