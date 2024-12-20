import { Component, createSignal, createEffect, For } from 'solid-js';
import { Portal } from 'solid-js/web';

interface EarthInfoProps {
  show: boolean;
  onClose: () => void;
}

const CityIcon: Component<{ city: string }> = (props) => {
  const icons: Record<string, string> = {
    'New York': '🗽',
    'London': '🎡',
    'Tokyo': '⛩️',
    'Sydney': '🏛️',
    'Dubai': '🕌',
    'Los Angeles': '🌴',
    'Local Time': '🏠'
  };

  return (
    <span class="text-lg inline-block transform-gpu group-hover:scale-125" style={{ "transition": "transform 200ms ease-out" }}>
      {icons[props.city] || '🌍'}
    </span>
  );
};

export const EarthInfo: Component<EarthInfoProps> = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(true);
  const [timeData, setTimeData] = createSignal<Record<string, string>>({});

  // Auto-minimize after 10 seconds
  createEffect(() => {
    if (isExpanded()) {
      const timer = setTimeout(() => setIsExpanded(false), 10000);
      return () => clearTimeout(timer);
    }
  });

  // Update times every minute
  createEffect(() => {
    const updateTimes = () => {
      const formatOptions = { 
        timeZone: 'America/New_York',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      } as Intl.DateTimeFormatOptions;

      const times: Record<string, string> = {
        'New York': new Date().toLocaleTimeString('en-US', { ...formatOptions, timeZone: 'America/New_York' }) + ' EST',
        'London': new Date().toLocaleTimeString('en-US', { ...formatOptions, timeZone: 'Europe/London' }) + ' GMT',
        'Tokyo': new Date().toLocaleTimeString('en-US', { ...formatOptions, timeZone: 'Asia/Tokyo' }) + ' GMT+9',
        'Sydney': new Date().toLocaleTimeString('en-US', { ...formatOptions, timeZone: 'Australia/Sydney' }) + ' GMT+11',
        'Dubai': new Date().toLocaleTimeString('en-US', { ...formatOptions, timeZone: 'Asia/Dubai' }) + ' GMT+4',
        'Los Angeles': new Date().toLocaleTimeString('en-US', { ...formatOptions, timeZone: 'America/Los_Angeles' }) + ' PST',
        'Local Time': new Date().toLocaleTimeString('en-US', { ...formatOptions }) + ' CST'
      };
      setTimeData(times);
    };

    updateTimes();
    // Update immediately and then set interval for next minute
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    
    // First timeout to sync with minute
    const syncTimeout = setTimeout(() => {
      updateTimes();
      // Then start the interval on the minute
      const interval = setInterval(updateTimes, 60000);
      return () => clearInterval(interval);
    }, msUntilNextMinute);

    return () => clearTimeout(syncTimeout);
  });

  return (
    <Portal>
      <div
        class="fixed right-8 bottom-24 bg-[rgba(20,20,20,0.95)] backdrop-blur-2xl text-white rounded-xl border border-white/10 shadow-2xl transition-all duration-500 ease-in-out select-none cursor-pointer z-50"
        style={{
          'max-height': isExpanded() ? '400px' : '64px',
          width: isExpanded() ? '320px' : '200px',
          overflow: 'hidden'
        }}
        onClick={() => setIsExpanded(!isExpanded())}
      >
        <div class="px-5 py-4 space-y-3">
          <div class="flex items-center gap-2.5">
            <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
            <span class="font-medium tracking-wide whitespace-nowrap">
              {isExpanded() ? 'Earth Time Zones' : (
                <div class="flex items-center gap-2">
                  <span class="text-lg">🌍</span>
                  <span>Time Zones</span>
                </div>
              )}
            </span>
          </div>

          <div 
            class="space-y-2 transition-all duration-500"
            style={{
              opacity: isExpanded() ? '1' : '0',
              transform: isExpanded() ? 'translateY(0)' : 'translateY(-8px)'
            }}
          >
            <For each={Object.entries(timeData())}>
              {([city, time]) => (
                <div class="flex items-center justify-between p-1.5 group cursor-default">
                  <div class="flex items-center gap-2">
                    <CityIcon city={city} />
                    <span class="text-sm text-white/80">{city}</span>
                  </div>
                  <span class="font-mono text-sm tabular-nums text-white/80">{time}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </Portal>
  );
}; 