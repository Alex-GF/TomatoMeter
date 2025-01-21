import { useVariableValue } from '@devcycle/react-client-sdk';
import { Pricing } from 'pricing4ts';
import { retrievePricingFromYaml } from 'pricing4ts';
import pricingYaml from '../resources/pricing.yml';

export class DevCycleClientManager {
  private static token: string = '';

  static async initializeDevCycle() {
    const pricing: Pricing = retrievePricingFromYaml(pricingYaml);
    const createdFeatures = this.performRequest(
      'https://api.devcycle.com/v1/projects/isa-group/features',
      'GET'
    ).then(response => console.log(response));

    console.log(createdFeatures);
    return {
      getFeature: (key: string) => {
        return useVariableValue(key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), false);
      },
    };
  }

  static async performRequest(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    headers: Record<string, string> = {}
  ) {
    return fetch(url, {
      method: 'GET',
      headers: {
        ...headers,
        Authorization: `Bearer ${this.token}`,
      },
    })
      .then(response => response.json())
      .catch(error => {
        this.generateNewToken();
        return fetch(url, {
          method: 'GET',
          headers: {
            ...headers,
            Authorization: `Bearer ${this.token}`,
          },
        });
      });
  }

  static async generateNewToken() {
    fetch('https://auth.devcycle.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        audience: 'https://api.devcycle.com',
        client_id: `${import.meta.env.VITE_DEVCYCLE_CLIENT_ID}`,
        client_secret: `${import.meta.env.VITE_DEVCYCLE_CLIENT_SECRET}`,
      }),
    }).then(response => response.json().then(data => (this.token = data.access_token)));
  }
}
