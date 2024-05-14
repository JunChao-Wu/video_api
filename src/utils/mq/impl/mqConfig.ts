
const mqHost = "192.168.137.133";
const mqPort = 5672;
const mqUserName = "guest";
const mqPassword = "guest12345";

const exchangeName = "e1_direct_upload";
const queueName = "q1_direct_upload";
const routingKey = "uploadIsolution";

export const queues = [
  "q1_direct_upload",
] as const;
export type QueuesType = typeof queues[number];

export const subQueues = [
  queues[0],
] as const;

export const mgConfig = {
  "vhosts": {
    "/": {
      "connectionStrategy": "random",
      "connection": {
        "slashes": true,
        "protocol": "amqp",
        "hostname": mqHost,
        "user": mqUserName,
        "password": mqPassword,
        "port": mqPort,
        "vhost": "/",
        "options": {
          "heartbeat": 60
        },
        "socketOptions": {
          "timeout": 10000
        },
        "retry": {
          "min": 1000,
          "max": 5000,
          "strategy": "linear"
        },
      },
      "publicationChannelPools": {
        "regularPool": {
          "max": 10,
          "min": 5,
          "evictionRunIntervalMillis": 10000,
          "idleTimeoutMillis": 60000,
          "autostart": true
        },
        "confirmPool": {
          "max": 10,
          "min": 5,
          "evictionRunIntervalMillis": 10000,
          "idleTimeoutMillis": 60000,
          "autostart": true
        }
      },
      "exchanges": {
        [exchangeName]: {
          "type": "direct",
          "options": {
            "durable": true
          }
        }
      },
      "queues": {
        [queueName]: {
          "options": {
            "autoDelete": false,
            "durable": true,
          }
        }
      },
      "bindings": {
        "b1": {
          "source": exchangeName,
          "destination": queueName,
          "destinationType": "queue",
          "bindingKey": routingKey
        }
      },
    },
  },
  "subscriptions": {
    [queueName]: {
      "queue": queueName,
      "vhost": "/",
      "prefetch": 1,
      "retry": {
        "delay": 1000
      }
    }
  },
  "publications": {
    [queueName]: {
      "vhost": "/",
      "exchange": exchangeName,
      "routingKey": routingKey,
      "confirm": true,
      "options": {
        "persistent": true
      }
    }
  },
} as const;