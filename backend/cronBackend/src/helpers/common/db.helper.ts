// import * as mysql from "mysql";
import * as config from "../../config";

class DbHelper {
  constructor() {
    this.initializePool();
  }
  /**
   * intialize Pool
   */
  public initializePool() {
    //initializing config variables first
    config.initiate();
  }
}
export default new DbHelper();
