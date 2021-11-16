import * as redis from 'redis';
class RedisHelper {
  // public client: redis.RedisClient;
  public clientInternal: any;
  private host: any = process.env.REDIS_HOSTNAME;
  private port: string = process.env.REDIS_PORT!;
  private auth: string = process.env.REDIS_AUTH!;

  constructor() {
    this.connectRedis();
  }

  public async connectRedis() {
    await this.connect().then(
      async (redConn: any) => {

        this.clientInternal = redConn;
      },
      (error: any) => {
        console.log('Redis connected error: ', error);
      },
    );
  }

  public async connect() {
    return new Promise((resolve, reject) => {
      const conn = redis.createClient(this.port, this.host);
      // this.client.auth(this.auth);
      conn.on('connect', () => {
        console.log('Redis Connected');
        resolve(conn);
      });
      conn.on('error', (err: any) => {
        reject(err);
      });
    });
  }

  // Set String value for given key
  // Note expires time secounds
  public async setString(
    key: string,
    value: string,
    expires: number = 0,
    database: string = '',
  ) {
    if (database !== '') {
      this.clientInternal.select(database);
    }
    return new Promise((resolve, reject) => {
      this.clientInternal.set(key, value, (err: any, reply: any) => {
        if (err) {
          return reject(err);
        }
        // Add Expire Time if provided
        if (expires !== 0) {
          this.clientInternal.expire(key, expires * 60);
        }
        resolve(reply);
      });
    });
  }

  // Get String value for given key, ETH
  public async getString(key: string, database: any = '') {
    if (database !== '') {
      this.clientInternal.select(database);
    }
    return new Promise((resolve, reject) => {
      this.clientInternal.get(key, (err: any, reply: any) => {
        if (err) {
          return reject(err);
        }
        resolve(reply);
      });
    });
  }

  // Delete given key from Radis cache, ETH
  public async deleteKey(key: string) {
    return new Promise((resolve, reject) => {
      this.clientInternal.del(key, (err: any, response: any) => {
        if (response === 1) {
          resolve(response);
        } else {
          if (err !== null) {
            return reject(err);
          } else {
            return resolve(true);
          }
        }
      });
    });
  }
}
export default new RedisHelper();
