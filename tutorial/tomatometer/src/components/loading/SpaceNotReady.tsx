import { motion } from 'framer-motion';

const MESSAGES: Record<'disconnected' | 'pending', { title: string; steps: string[] }> = {
  disconnected: {
    title: 'TomatoMeter is not connected to SPACE',
    steps: [
      'Copy the API key of your organization from SPACE (http://localhost:5403) into VITE_SPACE_API_KEY in .env.',
      'Connect the backend to SPACE (TODO B1 in api/space/client.ts).',
    ],
  },
  pending: {
    title: 'Waiting for the TomatoMeter service in SPACE',
    steps: [
      'Publish the TomatoMeter pricing in SPHERE (http://localhost:5402).',
      'In SPACE, create the TomatoMeter service linked to that SPHERE pricing.',
      'TomatoMeter then subscribes the demo user to the cheapest plan automatically.',
    ],
  },
};

/** Shown by the Pricing page until the subscription can be read from SPACE. */
export function SpaceNotReady({ status }: { status: 'disconnected' | 'pending' }) {
  const { title, steps } = MESSAGES[status];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-gradient-to-br from-purple-100 to-blue-100 p-8 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        className="h-14 w-14 rounded-full border-4 border-purple-400 border-t-transparent"
      />
      <h2 className="text-center text-2xl font-bold text-purple-700 dark:text-yellow-300">{title}</h2>
      <ol className="max-w-xl list-decimal space-y-2 pl-6 text-gray-700 dark:text-gray-300">
        {steps.map(step => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="text-sm text-gray-500 dark:text-gray-400">This page refreshes by itself every few seconds.</p>
    </div>
  );
}
