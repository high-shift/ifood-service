import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import iFoodProducer from '../infra/rabbitmq/ifood'

type IntervalPollParameter = {
  fn: () => Promise<AxiosResponse<any, any>>,
  validate: Function,
  interval: number
}

class IFoodService {

  pollingTime: number;
  url: string; 


  constructor(url: string, pollingTime: number) {
    this.url =  url;
    this.pollingTime = pollingTime;
  }

  async init() {
    const requestToIfood = async (): Promise<AxiosResponse<any, any>> => {
      const options = {
        auth: {
          username: '',
          password: ''
        }
      }
      return axios.get(this.url, options)
    }

    this.intervalPoll({
      fn: requestToIfood,
      validate: () => {},
      interval: this.pollingTime * 100
    })
  }

  validate(response: any) {
    if (response.data.length) {
      return true
    } else {
      return false;
    }
  }

  intervalPoll({fn, validate, interval}: IntervalPollParameter) {
      const executePoll = async (resolve: any, _reject: any) => {
        const result = await fn();

        if (validate(result)) {
          console.log(result.data);
          await iFoodProducer.producerOrder(result.data)
          setTimeout(executePoll, interval, resolve, _reject);
          return resolve(result)
        } else {
          setTimeout(executePoll, interval, resolve, _reject)
        }
      }
      return new Promise(executePoll)
  }
}
