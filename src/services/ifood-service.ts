import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import iFoodProducer from '../infra/rabbitmq/ifood';
import querystring from 'querystring';

import { config } from '../config'

type IntervalPollParameter = {
  fn: () => Promise<AxiosResponse<any, any>>,
  validate: Function,
  interval: number
}

class IFoodService {

  pollingTime: number;
  url: string;
  token: string;


  constructor(url: string, pollingTime: number) {
    // this.getIfoodToken()
    this.url =  url;
    this.pollingTime = pollingTime;
  }

  async init(token: string) {
  
    try {
      
      const requestToIfood = async (): Promise<AxiosResponse<any, any>> => {
        const options = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        return axios.get(`${this.url}order/v1.0/events:polling`, options)
      }
      this.intervalPoll({
        fn: requestToIfood,
        validate: this.validate,
        interval: this.pollingTime * 1000
      })
    } catch (error) {
      console.log(error)
    }

  }

  validate(response: any) {
    if (response.length) {
      return true
    } else {
      return false;
    }
  }

  intervalPoll({fn, validate, interval}: IntervalPollParameter) {
      const executePoll = async (resolve: any, _reject: any) => {
        const result = await fn();
        if (validate(result.data)) {
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

  async getIfoodToken() {
    const authOptions = new URLSearchParams({
      clientId: config.clientID,
      clientSecret: config.clientSecret,
      grantType: 'client_credentials'
    });
    try {
      const { data } = await axios.post(`${config.ifoodURL}authentication/v1.0/oauth/token`, authOptions, {
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      });
      return data.accessToken;
    } catch (error) {
        console.log(error)
    }
  }
  
}


export default IFoodService;