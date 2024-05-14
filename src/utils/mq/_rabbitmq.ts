import * as rascal from 'rascal'
import { Broker } from 'rascal'
import { Logger } from '@nestjs/common';
import { QueuesType, mgConfig, subQueues } from './impl/mqConfig';

const subHandlerMap = {
  [subQueues[0]]: "mergeHandler"
} as const;

export class RabbitMq {
  #broker: Broker;
  constructor(
  ) {
    this.init()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async mergeHandler(_msg: any): Promise<any> {
    return false;
  }

  private init() {
    const config = rascal.withDefaultConfig(mgConfig);
    Broker.create(config, (err, broker) => {
      if(err) throw err;
      broker.on("error", (err, { vhost, connectionUrl}) => {
        console.error('Broker error', err, vhost, connectionUrl);
      })
      .on("vhost_initialised", ({vhost, connectionUrl}) => {
        Logger.warn(` ~ Vhost: ${vhost} was initialised using connection: ${connectionUrl}`)
      })
      .on('blocked', (reason, { vhost, connectionUrl }) => {
        Logger.warn(` ~ Vhost: ${vhost} was blocked using connection: ${connectionUrl}. Reason: ${reason}`)
      })
      .on('unblocked', ({ vhost, connectionUrl }) => {
        Logger.warn(` ~ Vhost: ${vhost} was unblocked using connection: ${connectionUrl}.`)
      })
      this.#broker = broker;
      // 在这里初始化所有订阅
      for (let i = 0; i < subQueues.length; i++) {
        const queue = subQueues[i];
        this.initSubscribe(queue, this[subHandlerMap[queue]]);
      }
      Logger.log(`--------- RabbitMq 初始化成功 ---------`)
    })
  }

  initSubscribe (queue: QueuesType, callback: any) {
    this.subscribe(queue, callback);
  }

  private subscribe (queue: QueuesType, callback?: any) {
    return new Promise((reslove) => {
      this.#broker.subscribe(queue, (err, subscription) => {
        if(err) {
          Logger.error(err)
          throw err;
        }
        Logger.log(` ~ RabbitMq 订阅 queue: ${queue}`)
        // const _this = this;
        subscription.on("message", async (message, content, ackOrNack) => {
          try {
            const ack = await callback.call(this, content)
            if(!ack) {
              ackOrNack(new Error("error"))
            } else {
              ackOrNack()
            }
          } catch (error) {
            throw new Error(error)
          }
        })
        .on("error", (err) => {
          console.error("Subsciber error", err);
        })
        .on('invalid_content', (err, message, ackOrNack) => {
          console.error('Invalid content', err);
          ackOrNack(err);
        })
        reslove({})
      })
    })
  }
  
  publish (queue: QueuesType, data: any) {
    return new Promise((resolve) => {
      this.#broker.publish(queue, data, (err, publication) => {
        if(err) throw err;
        publication.on("error", (err, messageId) => {
          console.error("Publisher error", err, messageId);
        });
        resolve({})
      })
    })
  }
}
