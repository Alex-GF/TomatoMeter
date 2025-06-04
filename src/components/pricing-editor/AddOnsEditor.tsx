import { useState } from "react";
import { AddOn, PricingFeature, UsageLimit } from "../../types";
import { AnimatePresence, motion } from "framer-motion";

function camelToTitle(str: string) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

function Toggle({ checked, onChange }: { readonly checked: boolean; readonly onChange: (v: boolean) => void }) {
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

export function AddOnsEditor({
  addOns,
  onChange,
  features,
  usageLimits
}: {
  readonly addOns: Record<string, AddOn> | undefined;
  readonly onChange: (addOns: Record<string, AddOn>) => void;
  readonly features: Record<string, PricingFeature>;
  readonly usageLimits: Record<string, UsageLimit> | undefined;
}) {
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
  const [isScalable, setIsScalable] = useState(false);

  // Añadir nuevo add-on
  const addAddOn = () => {
    const newKey = `addon${addOns ? Object.keys(addOns).length + 1 : 1}`;
    const newAddOn: AddOn = {
      name: `New Add-on`,
      price: 0,
      features: {},
      usageLimits: {},
      usageLimitsExtensions: {},
    };
    onChange({ ...(addOns || {}), [newKey]: newAddOn });
    setModalOpen(newKey);
    setEditingAddOn(newAddOn);
    setIsScalable(false);
  };

  // Eliminar add-on
  const removeAddOn = (key: string) => {
    if (!addOns) return;
    const updated = { ...addOns };
    delete updated[key];
    onChange(updated);
  };

  // Guardar cambios en el modal
  const saveAddOn = (key: string) => {
    if (!editingAddOn) return;
    const updated = { ...(addOns || {}) };
    updated[key] = { ...editingAddOn };
    if (isScalable) {
      delete updated[key].features;
      delete updated[key].usageLimits;
    } else {
      delete updated[key].usageLimitsExtensions;
    }
    onChange(updated);
    setModalOpen(null);
    setEditingAddOn(null);
  };

  // Renderiza el formulario de edición de add-on
  function renderAddOnForm(addOn: AddOn, scalable: boolean) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Name</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={addOn.name}
            onChange={e => setEditingAddOn(a => ({ ...a!, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Price</label>
          <input
            type="number"
            className="border rounded px-2 py-1 w-full"
            value={addOn.price}
            onChange={e => setEditingAddOn(a => ({ ...a!, price: Number(e.target.value) }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={scalable}
            onChange={e => setIsScalable(e.target.checked)}
            id="scalable-addon"
          />
          <label htmlFor="scalable-addon" className="text-xs text-gray-600">Scalable add-on (usage limit extension)</label>
        </div>
        {!scalable ? (
          <>
            <div>
              <div className="font-semibold text-sm mb-1">Features</div>
              <div className="space-y-2">
                {Object.entries(features).map(([featureKey, feature]) => (
                  <div key={featureKey} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">{camelToTitle(featureKey)}</span>
                    {feature.valueType === 'BOOLEAN' ? (
                      <Toggle
                        checked={!!addOn.features?.[featureKey]}
                        onChange={v => setEditingAddOn(a => ({
                          ...a!,
                          features: { ...a!.features, [featureKey]: v }
                        }))}
                      />
                    ) : (
                      <input
                        type="text"
                        className="border rounded px-2 py-1 text-xs w-24"
                        value={typeof addOn.features?.[featureKey] === 'string' ? addOn.features?.[featureKey] : ''}
                        onChange={e => setEditingAddOn(a => ({
                          ...a!,
                          features: { ...a!.features, [featureKey]: e.target.value }
                        }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold text-sm mb-1 mt-2">Usage Limits</div>
              <div className="space-y-2">
                {usageLimits && Object.entries(usageLimits).map(([limitKey, limit]) => (
                  <div key={limitKey} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">{camelToTitle(limitKey)}</span>
                    {limit.valueType === 'BOOLEAN' ? (
                      <Toggle
                        checked={!!addOn.usageLimits?.[limitKey]}
                        onChange={v => setEditingAddOn(a => ({
                          ...a!,
                          usageLimits: { ...a!.usageLimits, [limitKey]: v }
                        }))}
                      />
                    ) : (
                      <input
                        type="number"
                        className="border rounded px-2 py-1 text-xs w-20"
                        value={typeof addOn.usageLimits?.[limitKey] === 'number' ? addOn.usageLimits?.[limitKey] : ''}
                        onChange={e => setEditingAddOn(a => ({
                          ...a!,
                          usageLimits: { ...a!.usageLimits, [limitKey]: Number(e.target.value) }
                        }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div>
            <div className="font-semibold text-sm mb-1">Usage Limit Extensions</div>
            <div className="space-y-2">
              {usageLimits && Object.entries(usageLimits).map(([limitKey]) => (
                <div key={limitKey} className="flex items-center justify-between">
                  <span className="text-xs text-gray-700">{camelToTitle(limitKey)}</span>
                  <input
                    type="number"
                    className="border rounded px-2 py-1 text-xs w-20"
                    value={typeof addOn.usageLimitsExtensions?.[limitKey] === 'number' ? addOn.usageLimitsExtensions?.[limitKey] : ''}
                    onChange={e => setEditingAddOn(a => ({
                      ...a!,
                      usageLimitsExtensions: { ...a!.usageLimitsExtensions, [limitKey]: Number(e.target.value) }
                    }))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Add-ons</h2>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={addAddOn}
        >
          + Add Add-on
        </button>
      </div>
      <div className="space-y-4">
        <AnimatePresence>
          {addOns && Object.entries(addOns).map(([key, addOn]) => (
            <motion.div
              key={key}
              layout
              className="bg-gray-50 rounded-lg p-3 shadow flex items-center justify-between cursor-pointer hover:bg-blue-50 transition"
              onClick={() => {
                setModalOpen(key);
                setEditingAddOn(addOn);
                setIsScalable(!!addOn.usageLimitsExtensions && Object.keys(addOn.usageLimitsExtensions).length > 0);
              }}
            >
              <span className="font-medium text-blue-700">{addOn.name}</span>
              <button
                className="text-red-500 hover:text-red-700 text-xs ml-2"
                onClick={e => {
                  e.stopPropagation();
                  removeAddOn(key);
                }}
              >
                Remove
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Modal de edición */}
      <AnimatePresence>
        {modalOpen && editingAddOn && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-md relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                onClick={() => { setModalOpen(null); setEditingAddOn(null); }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-lg font-bold mb-4">Edit Add-on</h3>
              {renderAddOnForm(editingAddOn, isScalable)}
              <div className="flex gap-2 mt-6">
                <button
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition font-semibold"
                  onClick={() => { setModalOpen(null); setEditingAddOn(null); }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
                  onClick={() => saveAddOn(modalOpen)}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
