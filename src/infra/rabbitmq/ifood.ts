import { rabbitMQClient } from ".";

class iFoodProducer {
    // TODO: Validate order message schema to create a Type for it.
    async producerOrder(orders: any[]) {
        for (const order of orders) {
            try {
               await rabbitMQClient.producer.publish('ifood', 'order.ifood', order) 
            } catch (error) {
                console.log(error)
                throw new Error(error)
            }
        }
    }
}

export default new iFoodProducer();