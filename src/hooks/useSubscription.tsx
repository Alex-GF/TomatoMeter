import { useContext } from "react";
import { SubscriptionContext } from "../contexts/subscriptionContext";

export function useSubscription() {
  const subscriptionContext = useContext(SubscriptionContext);
  if (!subscriptionContext) {
    throw new Error("SubscriptionContext not found or not properly initialized");
  }

  return { currentSubscription: subscriptionContext.currentSubscription, setCurrentSubscription: subscriptionContext.setCurrentSubscription };
}