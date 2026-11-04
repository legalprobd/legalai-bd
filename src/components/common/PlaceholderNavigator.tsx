import React from "react";
import { Search, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface PlaceholderNavigatorProps {
  content: string;
  onNavigateToPlaceholder?: (index: number) => void;
}

export function PlaceholderNavigator({ content, onNavigateToPlaceholder }: PlaceholderNavigatorProps) {
  // Find all matches for **[...]** or [...]
  const matches = React.useMemo(() => {
    const regex = /\*\*\[(.*?)\]\*\*|\[(.*?)\]/g;
    const found: string[] = [];
    let m;
    while ((m = regex.exec(content)) !== null) {
      const text = m[1] || m[2];
      if (text && !found.includes(text)) {
        found.push(text);
      }
    }
    return found;
  }, [content]);

  if (matches.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        সব প্রয়োজনীয় তথ্য ফিলাপ আছে (No gaps)
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-300 text-xs">
      <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        <span>পূরণীয় অংশ বাকি: {matches.length}টি</span>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto max-w-[260px] py-0.5">
        {matches.slice(0, 3).map((item, idx) => (
          <span
            key={idx}
            className="px-1.5 py-0.5 bg-white border border-amber-300 text-amber-800 rounded text-[10px] whitespace-nowrap"
          >
            {item}
          </span>
        ))}
        {matches.length > 3 && (
          <span className="text-[10px] text-amber-700 font-medium">
            +{matches.length - 3} আরো
          </span>
        )}
      </div>
    </div>
  );
}
