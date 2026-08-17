import { Sun } from "lucide-react";

export type Theme = "system" | "light" | "dark";

export interface ThemeControlProps {
  value: Theme;
  setValue: (value: Theme) => void;
}

export function ThemeControl({ value, setValue }: ThemeControlProps) {
  return (
    <label className="theme-control">
      <Sun />
      <span className="sr-only">Theme</span>
      <select value={value} onChange={(e) => setValue(e.target.value as Theme)}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
