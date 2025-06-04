import { useState, useEffect, useRef } from "react";
import { Pricing, Plan, UsageLimit } from "../../types";
import { AnimatePresence, motion } from "framer-motion";
import { toCamelCase } from "../../utils/helpers";

// Utilidad para transformar camelCase a texto con espacios
function camelToTitle(str: string) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

// Toggle switch visual
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      onClick={() => onChange(!checked)}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}></span>
    </button>
  );
}

// Editor de planes
export function PlansEditor({
  pricing,
  onChange,
  usageLimits
}: {
  pricing: Pricing;
  onChange: (plans: Record<string, Plan>) => void;
  usageLimits: Record<string, UsageLimit> | undefined;
}) {
  const [localPlans, setLocalPlans] = useState<Record<string, Plan>>(pricing.plans || {});
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const plansEndRef = useRef<HTMLDivElement>(null);

  // Sincroniza localPlans con pricing.plans si cambia el objeto pricing
  useEffect(() => {
    setLocalPlans(pricing.plans || {});
  }, [pricing.plans]);

  // Actualiza el valor de una feature en un plan
  const handleFeatureChange = (planKey: string, featureKey: string, value: string | boolean) => {
    setLocalPlans(prev => {
      const updated = { ...prev };
      updated[planKey] = {
        ...updated[planKey],
        features: { ...updated[planKey].features, [featureKey]: value }
      };
      onChange(updated);
      return updated;
    });
  };

  // Actualiza el valor de un usage limit en un plan
  const handleUsageLimitChange = (planKey: string, limitKey: string, value: number | boolean) => {
    setLocalPlans(prev => {
      const updated = { ...prev };
      updated[planKey] = {
        ...updated[planKey],
        usageLimits: { ...updated[planKey].usageLimits, [limitKey]: value }
      };
      onChange(updated);
      return updated;
    });
  };

  // Añadir nuevo plan
  const addPlan = () => {
    setLocalPlans(prev => {
      const newName = `newPlan`;
      const newPlanKey = toCamelCase(newName);
      const updated = {
        ...prev,
        [newPlanKey]: {
          name: newPlanKey,
          price: 0,
          features: {},
          usageLimits: {}
        }
      };
      onChange(updated);
      setTimeout(() => {
        plansEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        setEditingPlan(newPlanKey);
      }, 100);
      return updated;
    });
  };

  // Eliminar plan
  const removePlan = (planKey: string) => {
    setLocalPlans(prev => {
      const updated = { ...prev };
      delete updated[planKey];
      onChange(updated);
      return updated;
    });
  };

  // Cuando se inicia la edición, mostrar el nombre legible
  const startEditing = (planKey: string) => {
    setEditingPlan(planKey);
    setDisplayName(camelToTitle(localPlans[planKey]?.name ?? planKey));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Plans</h2>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={addPlan}
        >
          + Add Plan
        </button>
      </div>
      <div className="space-y-6">
        {/* Renderiza todos los planes actuales, aunque vengan del objeto pricing original */}
        {Object.entries(localPlans).length === 0 ? (
          <div className="text-gray-400 text-center py-8">No plans defined yet.</div>
        ) : (
          Object.entries(localPlans).map(([planKey, plan], idx, arr) => (
            <motion.div key={planKey} layout className="bg-gray-50 rounded-lg p-4 shadow" ref={idx === arr.length - 1 ? plansEndRef : undefined}>
              <div className="flex items-center justify-between mb-2">
                {editingPlan === planKey ? (
                  <input
                    className="font-bold text-blue-700 text-base bg-white border-b border-blue-400 focus:outline-none px-1"
                    value={displayName}
                    autoFocus
                    onBlur={() => {
                      // Al salir, guardar en camelCase
                      const newKey = toCamelCase(displayName);
                      setLocalPlans(prev => {
                        if (newKey !== planKey && displayName.trim() !== "") {
                          if (prev[newKey]) return prev; // Evita duplicados
                          const updated = { ...prev };
                          updated[newKey] = { ...updated[planKey], name: newKey };
                          delete updated[planKey];
                          onChange(updated);
                          setEditingPlan(null);
                          return updated;
                        } else {
                          const updated = { ...prev };
                          updated[planKey] = { ...updated[planKey], name: newKey };
                          onChange(updated);
                          setEditingPlan(null);
                          return updated;
                        }
                      });
                    }}
                    onChange={e => setDisplayName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                  />
                ) : (
                  <button
                    className="font-bold text-blue-700 text-base cursor-text bg-transparent border-none p-0"
                    onClick={() => startEditing(planKey)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') startEditing(planKey);
                    }}
                  >
                    {camelToTitle(plan.name ?? planKey)}
                  </button>
                )}
                <button
                  className="text-red-500 hover:text-red-700 text-xs"
                  onClick={() => removePlan(planKey)}
                >
                  Remove
                </button>
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500">Price</label>
                <input
                  type="number"
                  className="w-24 border rounded px-2 py-1 text-sm"
                  value={plan.price}
                  onChange={e => {
                    const price = Number(e.target.value);
                    setLocalPlans(prev => {
                      const updated = { ...prev };
                      updated[planKey] = { ...updated[planKey], price };
                      onChange(updated);
                      return updated;
                    });
                  }}
                />
              </div>
              <div className="divide-y divide-gray-200">
                {Object.entries(pricing.features).map(([featureKey, feature]) => {
                  const value = plan.features?.[featureKey] ?? feature.defaultValue;
                  const linkedLimits = Object.values(usageLimits || {}).filter(lim => lim.linkedFeatures?.includes(featureKey));
                  const isActive = (feature.valueType === 'BOOLEAN' && value === true) || (feature.valueType === 'TEXT' && value !== '');
                  return (
                    <div key={featureKey} className="py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{camelToTitle(featureKey)}</span>
                        {feature.valueType === 'BOOLEAN' ? (
                          <Toggle
                            checked={!!value}
                            onChange={v => handleFeatureChange(planKey, featureKey, v)}
                          />
                        ) : (
                          <input
                            type="text"
                            className="border rounded px-2 py-1 text-sm w-32"
                            value={typeof value === 'string' ? value : ''}
                            onChange={e => handleFeatureChange(planKey, featureKey, e.target.value)}
                          />
                        )}
                      </div>
                      {/* Usage limits vinculados */}
                      <AnimatePresence>
                        {isActive && linkedLimits.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4 mt-2 space-y-2"
                          >
                            {linkedLimits.map(limit => {
                              const limitValue = plan.usageLimits?.[limit.name] ?? limit.defaultValue;
                              return (
                                <div key={limit.name} className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">{camelToTitle(limit.name)}</span>
                                  {limit.valueType === 'BOOLEAN' ? (
                                    <Toggle
                                      checked={!!limitValue}
                                      onChange={v => handleUsageLimitChange(planKey, limit.name, v)}
                                    />
                                  ) : (
                                    <input
                                      type="number"
                                      className="border rounded px-2 py-1 text-xs w-20"
                                      value={typeof limitValue === 'number' ? limitValue : ''}
                                      onChange={e => handleUsageLimitChange(planKey, limit.name, Number(e.target.value))}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
