import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import * as rfs from "rotating-file-stream";
import * as fs from "fs";
import * as path from "path";
import { CronJob } from "cron";

import * as http from "http";
import { Controller } from "./interfaces";
import { errorMiddleware } from "./middlewares";
import MongoHelper from "./helpers/common/mongodb.helper";
import LogsETH from "./modules/logs/logs.modelETH";
import LogsBNB from "./modules/logs/logs.modelBNB";

import ResolveBetETH from "./modules/resolveBet/resolveBet.modelETH";
import ResolveBetBNB from "./modules/resolveBet/resolveBet.modelBNB";

class App {
  public app: express.Application;
  public port: any;
  private server: http.Server;
  constructor(controllers: Controller[]) {
    this.app = express();
    this.port = process.env.PORT ? process.env.PORT : 8082;
    this.server = http.createServer(this.app);
    // this.io = socketio.listen(this.server, { origins: '*:*' });
    MongoHelper.connectMongoDB();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  public listen() {
    this.server.listen(this.port, () => {
      console.log(`-- App listening on the port ${this.port}`);
    });

    return this.server;
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(helmet());

    // setup the logger
    this.saveLogs();
    this.startCron();
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
    this.app.get("/app/status", (req, res) => {
      return res.status(200).send({ status: "success" });
    });
  }
  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private saveLogs() {
    console.log("\n inside savelogs ------ ");
    const logDirectory = path.join(__dirname, "log");
    const exists = fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
    if (exists) {
      const accessLogStream = rfs.createStream("access.log", {
        interval: "1d",
        path: logDirectory,
      });

      this.app.use(morgan("combined", { stream: accessLogStream }));
    }
  }
  /**
   * common cron function
   */
  private startCron() {
    const job1 = new CronJob(
      "*/10 * * * * *",
      async () => {
        job1.stop();
        console.log("addUserLevellogs log cron every minute " + new Date());
        // await LogsETH.addNewUserLog();
        await LogsBNB.addNewUserLog();
        job1.start();
      },
      null,
      true,
      "Europe/London"
    );

    const job2 = new CronJob(
      "*/10 * * * * *",
      async () => {
        job2.stop();
        console.log(
          "Getting logs for resolved bet every 10 seconds" + new Date()
        );
        // await ResolveBetETH.addResolvedBetLogs();
        await ResolveBetBNB.addResolvedBetLogs();
        job2.start();
      },
      null,
      true,
      "Europe/London"
    );

    const job3 = new CronJob(
      "0 0 1 * * *",
      async () => {
        job3.stop();
        console.log("Updating price every day at 1 :00 am" + new Date());
        // await LogsETH.updatePrice();
        await LogsBNB.updatePrice();
        job3.start();
      },
      null,
      true,
      "Europe/London"
    );

    const job4 = new CronJob(
      "*/2 * * * * *",
      async () => {
        job4.stop();
        console.log("Preparing to resolve bets every  2 sec" + new Date());
        // await ResolveBetETH.prepareResolve();
        await ResolveBetBNB.prepareResolve();
        job4.start();
      },
      null,
      true,
      "Europe/London"
    );

    // const job5 = new CronJob(
    //   "0 */1 * * * *",
    //   async () => {
    //     job5.stop();
    //     console.log("Resolving Bet every minute" + new Date());
    //     await ResolveBetETH.resolvingBet();

    //     job5.start();
    //   },
    //   null,
    //   true,
    //   "Europe/London"
    // );

    // const job6 = new CronJob(
    //   "0 */15 * * * *",
    //   async () => {
    //     job6.stop();
    //     console.log(
    //       "Resolving unresolved bets in FINAL CRON after every 15 mins" +
    //         new Date()
    //     );
    //     await ResolveBetETH.finalCron();

    //     job6.start();
    //   },
    //   null,
    //   true,
    //   "Europe/London"
    // );

    const job7 = new CronJob(
      "0 */5 * * * *",

      async () => {
        job7.stop();
        console.log(
          "updating change of coins+++++++++++++++++>>>>>>>>>>>>>>>>>>>>"
        );
        // await LogsETH.updateChange();
        await LogsBNB.updateChange();
        console.log(
          "update change of coins+++++++++++++++++||||||||||||||||successs"
        );

        job7.start();
      },
      null,
      true,
      "Europe/London"
    );

    const job8 = new CronJob(
      "0 */1 * * * *",
      async () => {
        job8.stop();
        console.log("Resolving Bet every minute" + new Date());

        await ResolveBetBNB.resolvingBet();
        job8.start();
      },
      null,
      true,
      "Europe/London"
    );

    const job9 = new CronJob(
      "0 */15 * * * *",

      async () => {
        job9.stop();
        console.log(
          "Resolving unresolved bets in FINAL CRON after every 15 mins" +
            new Date()
        );

        await ResolveBetBNB.finalCron();
        job9.start();
      },
      null,
      true,
      "Europe/London"
    );
  }
}

export default App;
