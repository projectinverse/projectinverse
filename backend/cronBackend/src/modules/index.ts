/* common file to add all controllers(modules) in the project */
import LogsController from "./logs/logs.controller";
import ResolveBetController from "./resolveBet/resolveBet.controller";

export default [new LogsController(), new ResolveBetController()];
