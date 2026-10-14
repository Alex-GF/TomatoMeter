export interface UsageLevel {
  resetTimeStamp?: Date; // o Date si no es serializado
  consumed: number;
}

export interface ContractHistoryEntry {
  startDate: Date;
  endDate: Date;
  contractedServices: Record<string, string>;
  subscriptionPlans: Record<string, string>;
  subscriptionAddOns: Record<string, Record<string, number>>;
}

export interface UserContact {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}
export interface Contract {
  userContact: UserContact;
  billingPeriod: {
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
    renewalDays: number;
  };
  usageLevels: Record<string, Record<string, UsageLevel>>;
  contractedServices: Record<string, string>;
  subscriptionPlans: Record<string, string>;
  subscriptionAddOns: Record<string, Record<string, number>>;
  history: ContractHistoryEntry[];
}