import { Request, Response, NextFunction } from 'express';
import { container } from '../config/container';
import { testUserId } from '../utils/configurators';
import { getCurrentUser } from './requestContext';

const featureChecker = (req: Request, res: Response, next: NextFunction) => {
  
  const setHeaders = async () => {
    // Add the Pricing-Token header after the request is processed
    const userId = getCurrentUser() ?? testUserId;
    try{
      const token = await container.spaceClient?.features.generateUserPricingToken(userId);
      res.setHeader('Pricing-Token', token);
    }catch (error) {
      console.error('Error generating pricing token:', error);
    }
  };

  const wrap = async (method: keyof typeof res) => {
    const original = res[method];
    res[method] = async function (...args) {
      await setHeaders();
      return original.apply(this, args);
    };
  };

  wrap('send');
  wrap('json');
  wrap('end');

  next();
};

export default featureChecker;