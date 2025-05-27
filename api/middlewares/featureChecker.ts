import { Request, Response, NextFunction } from 'express';
import { container } from '../config/container';
import { testUserId } from '../utils/configurators';

const featureChecker = (req: Request, res: Response, next: NextFunction) => {
  
  const setHeaders = async () => {
    // Add the Pricing-Token header after the request is processed
    res.setHeader('Pricing-Token', await container.spaceClient?.features.generateUserPricingToken(testUserId));
  };

  const wrap = async (method: keyof typeof res) => {
    const original = res[method] as Function;
    res[method] = async function (...args: any[]) {
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