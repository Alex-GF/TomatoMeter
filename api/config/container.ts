export const container = {
  userContracts: [
    {
      userContact: {
        userId: 'testUserId',
        username: 'test',
      },
      usageLevels: {
        maxPomodoroTimers: 1,
      },
      contractedServices: {
        tomatometer: '1.0.0',
      },
      subscriptionPlans: {
        tomatometer: 'basic',
      },
      subscriptionAddOns: {
        tomatometer: {
          extraTimers: 2,
        },
      },
    },
  ],
  users: [{ id: 'testUserId' }],
};

export function getContractForUser(userId: string) {
  return container.userContracts.find(contract => contract.userContact.userId === userId);
}

export function updateContractForUser(userId: string, contractUpdate: Partial<typeof container.userContracts[0]>) {
  const contract = getContractForUser(userId);
  if (contract) {
    Object.assign(contract, contractUpdate);
  } else {
    throw new Error(`Contract for user ${userId} not found`);
  }
}

export function getUserById(userId: string) {
  return container.users.find(user => user.id === userId);
}