import { TimelineBar } from './TimelineBar';
import { useTimeline } from '../../contexts/timelineContext';

export function TimelineDual() {
  const { events } = useTimeline();
  // Separar eventos por tipo
  const providerEvents = events.filter(e => e.type === 'provider');
  const userEvents = events.filter(e => e.type === 'user');

  // Sincronización: ambos timelines avanzan a la misma cantidad de pasos (máximo de ambos)
  const maxSteps = Math.max(providerEvents.length > 0 ? providerEvents[providerEvents.length-1].timelineIndex ?? 0 : 0, userEvents.length > 0 ? userEvents[userEvents.length-1].timelineIndex ?? 0 : 0) + 1;

  return (
    <div className="w-full max-w-6xl mx-auto pt-6 pb-2 relative" style={{ minHeight: 120 }}>
      <div className="absolute left-0 top-0 flex flex-col gap-8 h-full justify-center z-10" style={{ minWidth: 160 }}>
        <div className="flex items-center h-12">
          <span className="text-lg font-extrabold text-blue-600 dark:text-yellow-300 whitespace-nowrap rotate-[-8deg]">Provider Events</span>
        </div>
        <div className="flex items-center h-12">
          <span className="text-lg font-extrabold text-purple-700 dark:text-yellow-400 whitespace-nowrap rotate-[-8deg]">User Events</span>
        </div>
      </div>
      <div className="pl-44 flex flex-col gap-8">
        <TimelineBar events={providerEvents} type="provider" maxSteps={maxSteps} />
        <TimelineBar events={userEvents} type="user" maxSteps={maxSteps} />
      </div>
    </div>
  );
}
