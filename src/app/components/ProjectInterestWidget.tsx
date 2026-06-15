import { Badge } from "./ui/badge";

export interface Project {
  id: string;
  /** SAP: extensions.Z_projectdescription */
  project: string;
  /** SAP: statusDescription */
  status: string;
  /** SAP: startDate (formatted as DD/MM/YYYY) */
  date: string;
}

interface ProjectInterestWidgetProps {
  projectCount: number;
  opportunityId: string | null;
  /** Optional message shown inside the card when the opportunity has no phone number */
  noPhoneMessage?: string;
}

const STATUS_STYLES: Record<string, string> = {
  "הושלם": "bg-emerald-50 border-emerald-200 text-emerald-700",
  "בתהליך": "bg-blue-50 border-blue-200 text-blue-700",
  "הושהה": "bg-amber-50 border-amber-200 text-amber-700",
  "בתכנון": "bg-violet-50 border-violet-200 text-violet-700",
};

// Export STATUS_STYLES so the history page can reuse them
export { STATUS_STYLES };

export function ProjectInterestWidget({
  projectCount,
  opportunityId,
  noPhoneMessage,
}: ProjectInterestWidgetProps) {
  const isZero = projectCount === 0;
  const isOne  = projectCount === 1;
  const isMany = projectCount > 1;

  // Card background — unchanged
  const cardBg = isMany
    ? "bg-green-50 border border-green-200 shadow-sm shadow-green-100"
    : "bg-white border border-gray-200 shadow-sm";

  // Left colour strip — unchanged
  const stripColor = isMany
    ? "bg-green-400"
    : isOne
    ? "bg-[#0070f2]"
    : "bg-gray-200";

  function handleClick() {
    if (isZero || !opportunityId) return;

    const width  = 1100;
    const height = 700;
    const left   = Math.round(window.screenX + (window.outerWidth  - width)  / 2);
    const top    = Math.round(window.screenY + (window.outerHeight - height) / 2);

    const historyUrl = `/?page=history&id=${encodeURIComponent(opportunityId)}`;
    window.open(
      historyUrl,
      "ProjectHistory",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  }

  return (
    <div className={`relative flex overflow-hidden rounded-lg ${cardBg} transition-all`} dir="rtl">
      {/* Left colour strip — unchanged */}
      <div className={`w-1 flex-shrink-0 self-stretch ${stripColor} rounded-r-none rounded-l-lg`} />

      <button
        onClick={handleClick}
        disabled={isZero}
        className={`flex items-center gap-1.5 px-4 py-3 text-sm flex-1 text-right w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0070f2] rounded-lg transition-colors ${
          isZero ? "cursor-default" : isMany ? "hover:bg-green-100/70" : "hover:bg-blue-50/60"
        }`}
      >
        {isZero && (
          <span className="text-gray-400">
            {noPhoneMessage ?? "לא התעניין בעבר בפרוייקטים נוספים"}
          </span>
        )}
        {isOne && (
          <span className="text-[#0070f2] font-medium underline-offset-2 hover:underline">
            הלקוח התעניין בעבר בפרוייקט אחד
          </span>
        )}
        {isMany && (
          <>
            <span className="text-green-900 font-medium">התעניין בעבר ב־</span>
            <span className="inline-flex items-center justify-center min-w-[1.6rem] h-6 px-2 rounded-full bg-orange-500 text-white font-bold text-xs shadow-sm">
              {projectCount}
            </span>
            <span className="text-green-900 font-medium">פרויקטים</span>
          </>
        )}
      </button>
    </div>
  );
}
