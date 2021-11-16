import { Request, Response, Router } from "express";

import * as Interfaces from "interfaces";

class ResolveBetController implements Interfaces.Controller {
  public path = "/Resolve";
  public router = Router();
  constructor() {
    this.initializeRoutes();
  }

  private async initializeRoutes() {
    this.router.all(`${this.path}/*`);
  }
}

export default ResolveBetController;
