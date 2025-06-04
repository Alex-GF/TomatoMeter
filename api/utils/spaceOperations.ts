import path from 'path';
import fs from 'fs';
import FormData from 'form-data';
import { FallbackSubscription } from 'space-node-client';
import { Pricing, Service } from '../types';
import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class SpaceServiceOperations {
  private static axiosInstance: AxiosInstance;

  static setAxiosInstance(url: string, apiKey: string) {
    this.axiosInstance = axios.create({
      baseURL: url,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    });
  }

  static async getService(serviceName: string): Promise<Service> {
    return await this.axiosInstance
      .get(`/services/${serviceName}`, {
        timeout: 5000,
      })
      .then(response => {
        return response.data;
      })
      .catch((error: any) => {
        console.error('Error retrieving service:', error.response?.data || error);
        throw error;
      });
  }

  /**
   * Retrieves the pricing information for a specific service and pricing version.
   *
   * @param serviceName - The name of the service for which pricing information is requested.
   * @param pricingVersion - The version of the pricing to retrieve.
   * @returns A promise that resolves to the pricing data.
   * @throws An error if the client is not connected to Space or if the request fails.
   *
   * @remarks
   * This method requires the client to be connected to Space before making the request.
   * It uses the Space client's HTTP URL and API key for authentication.
   *
   * @example
   * ```typescript
   * try {
   *   const pricing = await serviceModule.getPricing('exampleService', 'v1');
   *   console.log(pricing);
   * } catch (error) {
   *   console.error('Failed to retrieve pricing:', error);
   * }
   * ```
   */
  static async getPricing(serviceName: string, pricingVersion: string): Promise<Pricing> {
    return await this.axiosInstance
      .get(`/services/${serviceName}/pricings/${pricingVersion}`, {
        timeout: 5000,
      })
      .then(response => {
        return response.data;
      })
      .catch((error: any) => {
        console.error('Error retrieving pricing:', error.response?.data || error);
        throw error;
      });
  }

  static async addPricing(serviceName: string, url?: string, file?: Readable) {
    
    if (!url && !file) {
      throw new Error('You must provide either a URL or a file to add pricing.');
    }

    if (url && file) {
      throw new Error('You cannot provide both a URL and a file. Please provide only one.');
    }
    
    if (url) {
      const isRemoteUrl = /^(http|https):\/\//.test(url);
      const endpoint = `/services/${serviceName}/pricings`;
      if (isRemoteUrl) {
        return await this._postWithUrl(endpoint, url);
      } else {
        const resolvedPath = path.resolve(process.cwd(), url);
        return await this._postWithFilePath(endpoint, resolvedPath);
      }
    }

    if (file) {
      return await this._postWithFile(`/services/${serviceName}/pricings`, file);
    }
  }

  /**
   * Changes the availability status of a specific pricing version for a service.
   * The availability can be set to either "active" or "archived". If archiving,
   * a fallback subscription must be provided to ensure existing contracts are novated.
   *
   * @param serviceName - The name of the service whose pricing availability is being changed.
   * @param pricingVersion - The version of the pricing to update.
   * @param newAvailability - The new availability status ("active" or "archived").
   * @param fallbackSubscription - (Optional) A fallback subscription required when archiving.
   * @returns A promise that resolves with the response data from the Space API.
   * @throws An error if the availability status is invalid, if no fallback subscription is provided when archiving, or if the operation fails.
   */
  static async changePricingAvailability(
    serviceName: string,
    pricingVersion: string,
    newAvailability: 'active' | 'archived',
    fallbackSubscription?: FallbackSubscription
  ): Promise<Service> {
    if (newAvailability !== 'active' && newAvailability !== 'archived') {
      throw new Error('Invalid availability status. Use "active" or "archived".');
    }

    if (newAvailability === 'archived' && !fallbackSubscription) {
      throw new Error(
        "You must provide a fallback subscription before archiving. When archiving a pricing version, you must provide a valid subscription in the most recent version of the service's pricing in order to novate all existing contracts to it"
      );
    }

    return await this.axiosInstance
      .put(
        `/services/${serviceName}/pricings/${pricingVersion}?availability=${newAvailability}`,
        fallbackSubscription,
        {
          timeout: 5000,
        }
      )
      .then(response => {
        return response.data;
      })
      .catch((error: any) => {
        console.error('Error archiving pricing:', error.response.data);
        throw error;
      });
  }

  /**
   * Sends a POST request to the specified endpoint with a file as multipart/form-data.
   * The file is sent under the 'pricing' field with its original filename.
   *
   * @param endpoint - The API endpoint to which the file will be uploaded.
   * @param filePath - The absolute path to the file to upload.
   * @returns A promise that resolves with the response data from the Space API.
   * @throws An error if the operation fails.
   * @private
   */
  private static async _postWithFilePath(endpoint: string, filePath: string): Promise<Service> {
    const form = new FormData();
    const fileStream = fs.createReadStream(filePath);
    form.append('pricing', fileStream, path.basename(filePath));
    try {
      const response = await this.axiosInstance.post(endpoint, form, {
        headers: {
          ...form.getHeaders(),
          ...this.axiosInstance.defaults.headers.common,
          ...this.axiosInstance.defaults.headers.post,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 5000,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error adding service with file:', error.response?.data || error);
      throw error;
    }
  }

  private static async _postWithFile(endpoint: string, file: Readable): Promise<Service> {
    const form = new FormData();
    form.append('pricing', file, `${new Date().getTime()}.yaml`);
    try {
      const response = await this.axiosInstance.post(endpoint, form, {
        headers: {
          ...form.getHeaders(),
          ...this.axiosInstance.defaults.headers.common,
          ...this.axiosInstance.defaults.headers.post,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 5000,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error adding service with file:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Sends a POST request to the specified endpoint with a remote pricing URL.
   * The URL is sent in the request body under the 'pricing' field.
   *
   * @param endpoint - The API endpoint to which the URL will be sent.
   * @param pricingUrl - The remote URL of the pricing data.
   * @returns A promise that resolves with the response data from the Space API.
   * @throws An error if the operation fails.
   * @private
   */
  private static async _postWithUrl(endpoint: string, pricingUrl: string): Promise<Service> {
    return await this.axiosInstance
      .post(
        endpoint,
        { pricing: pricingUrl },
        {
          timeout: 5000,
        }
      )
      .then(response => {
        return response.data;
      })
      .catch((error: any) => {
        console.error('Error adding service/pricing:', error.response.data);
        throw error;
      });
  }

  static async addService(filePath: string): Promise<Service> {
    const form = new FormData();
    const resolvedPath = path.resolve(process.cwd(), filePath);
    const fileStream = fs.createReadStream(resolvedPath);
    form.append('pricing', fileStream, path.basename(resolvedPath));
    try {
      const response = await this.axiosInstance.post('/services', form, {
        headers: {
          ...form.getHeaders(),
          ...this.axiosInstance.defaults.headers.common,
          ...this.axiosInstance.defaults.headers.post,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 5000,
      });
      return response.data;
    } catch (error: any) {
      if ((error as any).response) {
        console.error('Error response from server:', (error as any).response.data);
        throw new Error(`Failed to add service: ${(error as any).response.data.message}`);
      } else if ((error as any).request) {
        console.error('No response received:', (error as any).request);
        throw new Error('Failed to add service: No response from server');
      } else {
        console.error('Error setting up request:', (error as any).message);
        throw new Error(`Failed to add service: ${(error as any).message}`);
      }
    }
    throw new Error('Unexpected error in addService');
  }
}
