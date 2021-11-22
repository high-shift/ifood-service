import axios from 'axios';
import 'dotenv/config'
import { config } from "./config";
import qs from 'querystring'
import IFoodService from "./services/ifood-service";

const getIfoodToken = async () =>  {
    const authOptions = qs.stringify({
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

(async () => {
    const token = await getIfoodToken();
    const ifoodService = new IFoodService(config.ifoodURL, 30);
    await ifoodService.init(token)
  
})()
