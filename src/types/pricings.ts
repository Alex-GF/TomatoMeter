export type PricingToCreate = Omit<Pricing, 'createdAt'> & {
  saasName?: string;
  syntaxVersion?: string;
  createdAt?: string;
};

export interface Pricing {
  id?: string;
  version: string;
  currency: string;
  createdAt: Date; // o Date si no haces `JSON.stringify`
  features: Record<string, PricingFeature>;
  usageLimits?: Record<string, UsageLimit>;
  plans?: Record<string, Plan>;
  addOns?: Record<string, AddOn>;
}

export interface PricingFeature {
  name: string;
  description?: string;
  valueType: 'BOOLEAN' | 'TEXT' | 'NUMERIC';
  defaultValue: string | boolean;
  value?: string | boolean;
  type:
    | 'INFORMATION'
    | 'INTEGRATION'
    | 'DOMAIN'
    | 'AUTOMATION'
    | 'MANAGEMENT'
    | 'GUARANTEE'
    | 'SUPPORT'
    | 'PAYMENT';
  integrationType?:
    | 'API'
    | 'EXTENSION'
    | 'IDENTITY_PROVIDER'
    | 'WEB_SAAS'
    | 'MARKETPLACE'
    | 'EXTERNAL_DEVICE';
  pricingUrls?: string[];
  automationType?: 'BOT' | 'FILTERING' | 'TRACKING' | 'TASK_AUTOMATION';
  paymentType?: 'CARD' | 'GATEWAY' | 'INVOICE' | 'ACH' | 'WIRE_TRANSFER' | 'OTHER';
  docUrl?: string;
  expression?: string;
  serverExpression?: string;
  render: 'auto' | 'enabled' | 'disabled';
  tag?: string;
}

export interface UsageLimit {
  name: string;
  description?: string;
  valueType: 'BOOLEAN' | 'NUMERIC';
  defaultValue: number | boolean;
  value?: number | boolean;
  type: 'RENEWABLE' | 'NON_RENEWABLE';
  trackable?: boolean;
  period?: Period;
  linkedFeatures?: string[];
}

export interface Plan {
  name?: string;
  description?: string;
  price: string | number;
  private?: boolean;
  features: Record<string, PricingFeature>;
  usageLimits?: Record<string, UsageLimit>;
}

export interface AddOn {
  name: string;
  description?: string;
  private?: boolean;
  price: string | number;
  availableFor?: string[];
  dependsOn?: string[];
  excludes?: string[];
  features?: Record<string, { value: string | boolean }>;
  usageLimits?: Record<string, { value: number | boolean }>;
  usageLimitsExtensions?: Record<string, { value: number }>;
  subscriptionConstraints?: SubscriptionConstraint;
}

// ----------------------------------------
// ------------- Auxiliar Types -----------
// ----------------------------------------

export interface Period {
  value: number;
  unit: 'SEC' | 'MIN' | 'HOUR' | 'DAY' | 'MONTH' | 'YEAR';
}

export interface SubscriptionConstraint {
  minQuantity?: number;
  maxQuantity?: number;
  quantityStep?: number;
}
