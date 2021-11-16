/* common file to add all controllers(modules) in the project */
import CoinsController from "./coinDetails/coin.controller";
import BetsController from "./betDetails/bet.controllers";

export default [new CoinsController(), new BetsController()];
