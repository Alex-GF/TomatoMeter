import { UnleashClient } from 'unleash-proxy-client';
import { Pricing, retrievePricingFromYaml } from 'pricing4ts';
import axios, { AxiosRequestConfig, Method } from 'axios';
//@ts-ignore
import demoPricing from "../resources/pricing.yml";

export class UnleashClientManager {
  private static instance: UnleashClient | undefined = undefined;
  private static pricing: Pricing;
  private static API_KEY: string = '*:*.e0fe9eccbbb170dd18a787653b7af2dd38a75ee16ced1b0fc99d58b5';
  private static UNLEASH_HOST: string = 'http://localhost:4242';
  private static UNLEASH_PROJECT_ID: string = "default"

  static async initializeUnleash() {
    if (this.instance) {
      return this.instance;
    }

    return new Promise((resolve, reject) => {
      const unleash = new UnleashClient({
        url: 'http://localhost:4242/api/frontend/',
        clientKey: '*:development.92c2555a8363936ac478b0212a511f72de6c28962c34e72d1c3e3db2',
        appName: 'pricing-driven-feature-toggling-demo',
      });

      unleash.on('ready', async () => {
        this.instance = unleash;
        console.log('Unleash synchronized');

        this.pricing = retrievePricingFromYaml(demoPricing);

        await UnleashClientManager.createFeatureToggles();

        resolve({
          getFeature: (key: string) => {
            return unleash.isEnabled(key);
          },
        });
      });

      unleash.on('error', (error: any) => {
        reject(error);
      });

      unleash.start();
    });
  }

  static async createFeatureToggles() {
    if (!this.pricing) {
      throw new Error('Pricing has not been defined');
    }

    console.log("Creating feature toggles")

    const features = Object.values(this.pricing.features);

    let config: AxiosRequestConfig = {
      method: 'delete' as Method,
      maxBodyLength: Infinity,
      url: `http://localhost:4242/api/admin/projects/${this.UNLEASH_PROJECT_ID}/features/test`,
      headers: { 
        'Authorization': `*:*.e0fe9eccbbb170dd18a787653b7af2dd38a75ee16ced1b0fc99d58b5`,
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }
    };

    try{
      const response = await axios.request(config)
      console.log(JSON.stringify(response.data));
      return Promise.all(
        features.map(feature => {
          return axios.post(
            `${this.UNLEASH_HOST}/api/admin/projects/default/features`,
            {
              type: 'permission',
              name: feature.name,
              description: feature.description,
              impressionData: false,
            },
            {
              headers: {
                Authorization: this.API_KEY,
                'Content-Type': 'application/json',
                
              },
            }
          );
        })
      );
    }catch(err){
      console.warn(err)
    }
  }
}
