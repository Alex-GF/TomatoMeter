import { createContext } from "react";

export type SettingsToggle = {
  'Enable sound notifications': boolean;
  'Dark mode': boolean;
  'Custom pomodoro duration': boolean;
  'Motivational quotes': boolean;
  'Show plan/add-on notifications': boolean;
};

export const SettingsContext = createContext<{ toggles: SettingsToggle; setToggles: React.Dispatch<React.SetStateAction<SettingsToggle>>; }>({
  toggles: {
    'Enable sound notifications': true,
    'Dark mode': false,
    'Custom pomodoro duration': false,
    'Motivational quotes': false,
    'Show plan/add-on notifications': true,
  },
  setToggles: () => {},
});