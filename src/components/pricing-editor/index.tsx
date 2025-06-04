import { useEffect, useState } from 'react';
import { Pricing, Plan, AddOn, PricingToCreate } from '../../types';
import axios from '../../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PlansEditor } from './PlansEditor';
import { AddOnsEditor } from './AddOnsEditor';

interface PricingEditorProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly side?: 'left' | 'right';
}

export default function PricingEditor({ open, onClose, side = 'right' }: PricingEditorProps) {
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [editedPlans, setEditedPlans] = useState<Record<string, Plan> | undefined>(undefined);
  const [editedAddOns, setEditedAddOns] = useState<Record<string, AddOn> | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler para cerrar al hacer click fuera del sidebar
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Si el click es directamente en el overlay (no en el sidebar)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (open) {
      axios
        .get('/contracts/pricing')
        .then(response => {
          const fetchedPricing: Pricing = response.data;
          setPricing(fetchedPricing);
          setEditedPlans(fetchedPricing.plans);
          setEditedAddOns(fetchedPricing.addOns);
        })
        .catch(error => {
          console.error('Error fetching pricing:', error);
        });
    }
  }, [open]);

  const handlePlansChange = (plans: Record<string, Plan>) => {
    setEditedPlans(plans);
    // Si se añade un nuevo plan, inclúyelo en availableFor de todos los add-ons existentes
    if (editedAddOns) {
      const planKeys = Object.keys(plans);
      const prevPlanKeys = editedPlans ? Object.keys(editedPlans) : [];
      // Detecta si hay algún plan nuevo
      const newPlans = planKeys.filter(k => !prevPlanKeys.includes(k));
      if (newPlans.length > 0) {
        const updatedAddOns = { ...editedAddOns };
        Object.entries(updatedAddOns).forEach(([addOnKey, addOn]) => {
          if (Array.isArray(addOn.availableFor)) {
            // Añade los nuevos planes si no están ya
            const newAvailable = [...addOn.availableFor];
            newPlans.forEach(planKey => {
              if (!newAvailable.includes(planKey)) newAvailable.push(planKey);
            });
            updatedAddOns[addOnKey] = { ...addOn, availableFor: newAvailable };
          }
        });
        setEditedAddOns(updatedAddOns);
      }
    }
  };

  const position = side === 'left' ? { left: 0, right: 'auto' } : { right: 0, left: 'auto' };
  const initialX = side === 'left' ? '-100%' : '100%';

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}
          >
            {/* Overlay oscuro */}
            <div className="absolute inset-0 bg-black bg-opacity-40" onClick={handleOverlayClick}/>
            {/* Sidebar */}
            <motion.aside
              initial={{ x: initialX }}
              animate={{ x: 0 }}
              exit={{ x: initialX }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative h-full w-[350px] max-w-full bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
              style={position}
              onClick={e => e.stopPropagation()} // Evita que el click en el sidebar cierre el modal
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h1 className="text-xl font-bold">Pricing Editor</h1>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                  aria-label="Close pricing editor"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {pricing ? (
                  <>
                    <PlansEditor
                      pricing={pricing}
                      onChange={handlePlansChange}
                      usageLimits={pricing.usageLimits}
                    />
                    <AddOnsEditor
                      addOns={editedAddOns}
                      onChange={setEditedAddOns}
                      features={pricing.features}
                      usageLimits={pricing.usageLimits}
                    />
                    <button
                      className="mt-8 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={async () => {
                        if (!editedPlans || Object.keys(editedPlans).length === 0) return;

                        // --- Add-on/plan consistency check ---
                        const validPlanKeys = editedPlans ? Object.keys(editedPlans) : [];
                        const cleanedAddOns = { ...editedAddOns };
                        if (cleanedAddOns) {
                          for (const [addOnKey, addOn] of Object.entries(cleanedAddOns)) {
                            if (Array.isArray(addOn.availableFor)) {
                              // Filtra los planes que ya no existen
                              const filtered = addOn.availableFor.filter(plan => validPlanKeys.includes(plan));
                              if (filtered.length === 0) {
                                // Si no queda ningún plan válido, elimina el add-on
                                delete cleanedAddOns[addOnKey];
                              } else if (filtered.length !== addOn.availableFor.length) {
                                // Si se han eliminado planes, actualiza el array
                                cleanedAddOns[addOnKey] = { ...addOn, availableFor: filtered };
                              }
                            }
                          }
                        }
                        // --- END CHECK ---
                        const newPricing: PricingToCreate = {
                          ...pricing,
                          createdAt: new Date().toISOString().split('T')[0],
                          plans: editedPlans,
                          addOns: cleanedAddOns,
                        };

                        setIsSubmitting(true);

                        console.log(newPricing)

                        await axios.post('/contracts/pricing', newPricing);
                        setIsSubmitting(false);
                        onClose();
                        setEditedPlans(undefined);
                        setEditedAddOns(undefined);
                      }}
                      disabled={!editedPlans || Object.keys(editedPlans).length === 0 || isSubmitting}
                    >
                      Submit Pricing
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-400 animate-pulse">Loading pricing...</span>
                  </div>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Loader modal siempre a nivel raíz, nunca dentro del sidebar */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center gap-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <svg
                className="animate-spin h-10 w-10 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <span className="text-blue-700 font-semibold text-lg">
                Saving pricing...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
