import { RabbitMQClient } from 'rabbitmq-client'

const amqpUrl = process.env.RABBITMQ_URL;
const rabbitMQClient = new RabbitMQClient(amqpUrl, { consumer: true });

export {
    rabbitMQClient
}