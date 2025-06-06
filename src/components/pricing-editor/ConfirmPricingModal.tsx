import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmPricingModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmPricingModal({ open, onConfirm, onCancel }: ConfirmPricingModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center gap-4 max-w-md w-full"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <svg className="text-yellow-500 mb-2" width="48" height="48" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#FEF3C7" />
              <path d="M12 8v4m0 4h.01" stroke="#F59E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 text-center">Confirm Pricing Update</h2>
            <p className="text-gray-600 text-center">
              You are about to update the pricing. This will immediately affect all users. <br />
              <span className="font-semibold text-yellow-700">Your contract will be novated</span> and you will be subscribed to the <span className="font-semibold">first plan</span> of the new pricing.
            </p>
            <div className="flex gap-4 mt-4 w-full">
              <button
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition font-semibold"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
                onClick={onConfirm}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
