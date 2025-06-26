import { Request, Response, NextFunction } from 'express';
import { generateUserPricingToken } from 'pricing4ts/server';

const featureChecker = (req: Request, res: Response, next: NextFunction) => {  
  const setHeaders = async () => {
    // Add the Pricing-Token header after the request is processed
    const generatedToken = generateUserPricingToken();
    res.setHeader('Pricing-Token', generatedToken);
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