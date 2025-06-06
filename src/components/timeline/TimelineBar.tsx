import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { TimelineEvent } from '../../contexts/timelineContext';

interface TimelineBarProps {
  events: TimelineEvent[];
  type: 'provider' | 'user';
  maxSteps?: number;
}

export function TimelineBar({ events, type, maxSteps }: TimelineBarProps) {
  // maxSteps: longitud máxima de ambos timelines para sincronía
  // Usamos el mayor timelineIndex de todos los eventos + 1
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll automático al final cuando hay nuevos eventos
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: containerRef.current.scrollWidth, behavior: 'smooth' });
    }
  }, [events.length]);

  // Constantes de layout
  const DOT_SIZE = 20;
  const GAP = 100;
  const TIMELINE_HEIGHT = 40;

  // Calcula la posición X de cada punto según timelineIndex
  const getDotX = (timelineIndex: number) => timelineIndex * GAP;

  // Determina el rango visible de timelineIndex según el scroll (últimos N puntos)
  const MAX_VISIBLE = 8; // número máximo de checkpoints visibles
  const lastTimelineIndex = maxSteps ? maxSteps - 1 : (events.length > 0 ? events[events.length - 1].timelineIndex ?? 0 : 0);
  const firstVisibleIndex = Math.max(0, lastTimelineIndex - MAX_VISIBLE + 1);

  // Para cada posición visible, busca el evento correspondiente (o undefined)
  const visibleDots = Array.from({ length: Math.min(MAX_VISIBLE, lastTimelineIndex + 1) }).map((_, i) => {
    const timelineIndex = firstVisibleIndex + i;
    return events.find(e => (e.timelineIndex ?? -1) === timelineIndex);
  });

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto scrollbar-none"
      style={{ height: TIMELINE_HEIGHT, position: 'relative', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
    >
      <div
        className="relative flex items-center"
        style={{ minWidth: MAX_VISIBLE * GAP + DOT_SIZE * 2, height: TIMELINE_HEIGHT }}
      >
        {/* Línea animada solo para el rango visible */}
        <motion.div
          className={`absolute top-1/2 left-0 h-2 rounded-full z-0 ${type === 'provider' ? 'bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-300' : 'bg-gradient-to-r from-purple-400 to-purple-600 dark:from-yellow-400 dark:to-yellow-600'}`}
          style={{
            width: visibleDots.length > 1 ? getDotX(visibleDots.length - 1) : 0,
            transform: `translateY(-50%)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: visibleDots.length > 1 ? getDotX(visibleDots.length - 1) : 0 }}
          transition={{ duration: 0.5, type: 'tween', stiffness: 120 }}
        />
        {/* Puntos visibles (pueden ser undefined si no hay evento en ese timelineIndex) */}
        {visibleDots.map((event, idx) => (
          <DotWithTooltip
            key={event?.id ?? `empty-${firstVisibleIndex + idx}`}
            event={event}
            idx={idx}
            type={type}
            x={getDotX(idx)}
            visible={!!event}
            dotSize={DOT_SIZE}
            timelineHeight={TIMELINE_HEIGHT}
          />
        ))}
      </div>
    </div>
  );
}

// DotWithTooltip: punto animado y tooltip
function DotWithTooltip({ event, idx, type, x, visible, dotSize, timelineHeight }: {
  event?: TimelineEvent;
  idx: number;
  type: 'provider' | 'user';
  x: number;
  visible: boolean;
  dotSize: number;
  timelineHeight: number;
}) {
  const [hovered, setHovered] = useState(false);
  // Centra el punto verticalmente
  const y = (timelineHeight - dotSize) / 2;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={visible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ delay: idx * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
      className="flex flex-col items-center"
      style={{ position: 'absolute', left: x, top: y, width: dotSize, height: dotSize, pointerEvents: 'auto' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`w-5 h-5 rounded-full border-4 ${type === 'provider' ? 'border-blue-400 bg-white' : 'border-purple-400 bg-white'} shadow-lg flex items-center justify-center cursor-pointer transition-transform duration-150 ${hovered ? 'scale-110' : ''}`}
      />
      {/* Tooltip solo si hay evento */}
      {hovered && event && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.18 }}
          className="fixed z-[120] min-w-[260px] max-w-[350px] px-4 py-2 rounded-xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-100 font-semibold pointer-events-none"
          style={{ left: `max(16px, min(${x + 40}px, 90vw - 350px))`, top: `120px` }}
        >
          <div className="mb-1 font-bold text-blue-500 dark:text-yellow-400">
            {type === 'provider' ? 'Provider Event' : 'User Event'}
          </div>
          <div className="text-gray-700 dark:text-gray-200">
            {event.label}
          </div>
          {event.details && <div className="mt-1 text-gray-400 dark:text-gray-400">{event.details}</div>}
          {type === 'provider' && event.plansSnapshot && (
            <div className="mt-2">
              <div className="font-bold text-xs mb-1 text-blue-600 dark:text-yellow-300">Plans</div>
              <ul className="mb-1 max-h-32 overflow-y-auto pr-2">
                {Object.entries(event.plansSnapshot).map(([planKey, plan]) => (
                  <li key={planKey} className="text-xs text-gray-700 dark:text-gray-200">
                    <span className="font-semibold">{plan.name || planKey}</span>: ${plan.price} {plan.description && <span className="text-gray-400 ml-1">({plan.description})</span>}
                  </li>
                ))}
              </ul>
              {event.addOnsSnapshot && (
                <>
                  <div className="font-bold text-xs mb-1 text-purple-600 dark:text-yellow-300">Add-ons</div>
                  <ul className="max-h-32 overflow-y-auto pr-2">
                    {Object.entries(event.addOnsSnapshot).map(([addOnKey, addOn]) => (
                      <li key={addOnKey} className="text-xs text-gray-700 dark:text-gray-200">
                        <span className="font-semibold">{addOn.name || addOnKey}</span>: ${addOn.price} {addOn.description && <span className="text-gray-400 ml-1">({addOn.description})</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
          {/* Mostrar snapshot de suscripción para eventos de usuario */}
          {type === 'user' && event.plansSnapshot && (
            <div className="mt-2">
              <div className="font-bold text-xs mb-1 text-purple-600 dark:text-yellow-300">Plan</div>
              <div className="text-xs text-gray-700 dark:text-gray-200">
                {Object.values(event.plansSnapshot)[0]?.name || Object.keys(event.plansSnapshot)[0]}
              </div>
              {event.addOnsSnapshot && Object.keys(event.addOnsSnapshot).length > 0 && (
                <>
                  <div className="font-bold text-xs mb-1 text-purple-600 dark:text-yellow-300">Add-ons</div>
                  <ul className="max-h-32 overflow-y-auto pr-2">
                    {Object.entries(event.addOnsSnapshot).map(([addOnKey, qty]) => (
                      typeof qty === 'number' && qty > 0 ? (
                        <li key={addOnKey} className="text-xs text-gray-700 dark:text-gray-200">
                          <span className="font-semibold">{addOnKey}</span>{qty > 1 ? ` ×${qty}` : ''}
                        </li>
                      ) : null
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
          <div className="mt-1 text-[10px] text-gray-400">{new Date(event.timestamp).toLocaleString()}</div>
        </motion.div>
      )}
    </motion.div>
  );
}
