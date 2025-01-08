import { UnleashClient } from 'unleash-proxy-client';

export class UnleashClientManager {
  private static instance: UnleashClient | undefined = undefined;

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

      unleash.on('ready', () => {
        this.instance = unleash;
        console.log('Unleash synchronized');
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
}
