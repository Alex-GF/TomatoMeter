import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type TimelineEventType = 'provider' | 'user';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: number;
  label: string;
  details?: string;
  // Para eventos sincronizados (provider/user en el mismo tick)
  linkedId?: string;
  // For provider events: snapshot of pricing state
  plansSnapshot?: Record<string, import('../../types').Plan>;
  addOnsSnapshot?: Record<string, import('../../types').AddOn> | Record<string, number>;
  timelineIndex?: number; // posición global en el timeline
}

interface TimelineContextType {
  events: TimelineEvent[];
  addEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => string;
  clearEvents: () => void;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  // Add initial events on mount if empty
  useEffect(() => {
    if (events.length === 0) {
      const now = Date.now();
      const initialId = `init-${now}`;
      setEvents([
        {
          id: `provider-${initialId}`,
          type: 'provider',
          timestamp: now,
          label: 'Initial pricing state',
          linkedId: initialId,
          timelineIndex: 0,
        },
        {
          id: `user-${initialId}`,
          type: 'user',
          timestamp: now,
          label: 'Initial subscription state',
          linkedId: initialId,
          timelineIndex: 0,
        },
      ]);
    }
  }, [events.length]);

  function addEvent(event: Omit<TimelineEvent, 'id' | 'timestamp' | 'timelineIndex'>) {
    // El siguiente índice global es el mayor actual + 1
    const nextIndex = (events.length > 0 ? Math.max(...events.map(e => e.timelineIndex ?? 0)) + 1 : 0);
    const id = `${event.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newEvent: TimelineEvent = {
      ...event,
      id,
      timestamp: Date.now(),
      timelineIndex: nextIndex,
    };
    setEvents(prev => [...prev, newEvent]);
    return id;
  }

  function clearEvents() {
    setEvents([]);
  }

  return (
    <TimelineContext.Provider value={{ events, addEvent, clearEvents }}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  const ctx = useContext(TimelineContext);
  if (!ctx) throw new Error('useTimeline must be used within a TimelineProvider');
  return ctx;
}
