import { motion } from 'framer-motion';

export function PricingLoader({title, message}: {title: string, message: string}) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="w-20 h-20 rounded-full border-8 border-purple-400 border-t-transparent shadow-lg"
        />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-bold text-purple-700 dark:text-yellow-300 mb-2 text-center"
      >
        Loading {title}...
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-md text-gray-600 dark:text-gray-300 text-center max-w-md"
      >
        {message || 'Please wait while we fetch the latest information.'}
      </motion.p>
    </div>
  );
}

export default PricingLoader;
