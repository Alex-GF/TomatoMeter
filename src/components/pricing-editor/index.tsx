import { useEffect, useState } from "react";
import { Pricing } from "../../types";
import axios from "../../lib/axios";
import { motion, AnimatePresence } from "framer-motion";

interface PricingEditorProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly side?: "left" | "right";
}

export default function PricingEditor({ open, onClose, side = "right" }: PricingEditorProps) {
  const [pricing, setPricing] = useState<Pricing | null>(null);

  useEffect(() => {
    if (open) {
      axios.get('/contracts/pricing')
        .then(response => {
          const fetchedPricing: Pricing = response.data;
          setPricing(fetchedPricing);
        })
        .catch(error => {
          console.error('Error fetching pricing:', error);
        });
    }
  }, [open]);

  const position = side === "left" ? { left: 0, right: 'auto' } : { right: 0, left: 'auto' };
  const initialX = side === "left" ? '-100%' : '100%';

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: initialX }}
          animate={{ x: 0 }}
          exit={{ x: initialX }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 h-full w-[350px] max-w-full bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
          style={position}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h1 className="text-xl font-bold">Pricing Editor</h1>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              aria-label="Close pricing editor"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {pricing ? (
              <div>
                {/* Aquí irá el editor visual de pricing en el futuro */}
                <p className="text-gray-600">This feature is under development.</p>
                <p className="text-gray-600">Please check back later!</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400 animate-pulse">Loading pricing...</span>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}