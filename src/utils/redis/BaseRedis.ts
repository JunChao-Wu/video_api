import { RedisClientType, createClient } from "redis";

export type clientOptionsType = {
  name: "client";
  userName: string;
  password: string;
  host: string;
  port: string;
  db_index: string;
  _timeout?: NodeJS.Timeout
}

export class BaseRedis {
  public client: RedisClientType;
  private clientStore: clientOptionsType
  constructor() {
  }

  static init(obj: new () => any, options: clientOptionsType) {
    const redis = new obj();
    redis._init(options)
    console.log("初始化redis");
    return redis;
  }

  private _init (options: clientOptionsType) {
    this.client = this._createClient(options);
    this.connectEvent(this.client, options)
  }

  private _createClient (clientOptions: clientOptionsType): RedisClientType {
    const { userName, password, host, port, db_index } = clientOptions;
    const url = `redis://${userName}:${password}@${host}:${port}/${db_index}`;
    const newClient = createClient({
      url
    });
    this.clientStore = clientOptions;
    return newClient as RedisClientType;
  }

  private async connectEvent(client: RedisClientType, clientOptions: clientOptionsType) {
    if (clientOptions._timeout) {
      clearTimeout(clientOptions._timeout)
    }
    await client.on("error", (err) => {
      console.log(err);
      if (!clientOptions._timeout) {
        clientOptions._timeout = setTimeout(async () => {
          await this.reConnectEvent(client, clientOptions);
        }, 3000)
      }
    }).connect();
  }

  private async reConnectEvent(client: RedisClientType, clientOptions: clientOptionsType) {
    if (!clientOptions._timeout) {
      return;
    }
    console.log("重连redis");
    await client.disconnect();

    this.client = this._createClient(clientOptions)

    await this.connectEvent(this.client, clientOptions);
  }
}
