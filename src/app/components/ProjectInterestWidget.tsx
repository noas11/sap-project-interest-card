import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

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
  projects?: Project[];
  /** Optional message shown inside the card when the opportunity has no phone number */
  noPhoneMessage?: string;
}

const STATUS_STYLES: Record<string, string> = {
  "הושלם": "bg-emerald-50 border-emerald-200 text-emerald-700",
  "בתהליך": "bg-blue-50 border-blue-200 text-blue-700",
  "הושהה": "bg-amber-50 border-amber-200 text-amber-700",
  "בתכנון": "bg-violet-50 border-violet-200 text-violet-700",
};

export function ProjectInterestWidget({
  projectCount,
  projects = [],
  noPhoneMessage,
}: ProjectInterestWidgetProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isZero = projectCount === 0;
  const isOne = projectCount === 1;
  const isMany = projectCount > 1;

  // Card background
  const cardBg = isMany
    ? "bg-green-50 border border-green-200 shadow-sm shadow-green-100"
    : "bg-white border border-gray-200 shadow-sm";

  // Row left-side indicator strip
  const stripColor = isMany
    ? "bg-green-400"
    : isOne
    ? "bg-[#0070f2]"
    : "bg-gray-200";

  return (
    <>
      {/* Widget card */}
      <div className={`relative flex overflow-hidden rounded-lg ${cardBg} transition-all`} dir="rtl">
        {/* Left color strip (visual indicator) */}
        <div className={`w-1 flex-shrink-0 self-stretch ${stripColor} rounded-r-none rounded-l-lg`} />

        <button
          onClick={() => !isZero && setIsDialogOpen(true)}
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

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 text-right">
              רשימת פרויקטים קודמים
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[380px] w-full rounded-md border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right font-semibold text-gray-700 py-2.5">פרויקט</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 py-2.5">סטטוס</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 py-2.5">תאריך</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-400 py-10 text-sm">
                      לא נמצאו פרויקטים קודמים
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project, idx) => (
                    <TableRow
                      key={project.id}
                      className={`hover:bg-blue-50/50 transition-colors ${idx % 2 === 1 ? "bg-gray-50/60" : ""}`}
                    >
                      <TableCell className="text-right font-medium text-gray-800 py-3">
                        {project.project}
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${STATUS_STYLES[project.status] ?? "bg-gray-50 border-gray-200 text-gray-600"}`}
                        >
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-gray-500 text-sm py-3 tabular-nums">
                        {project.date}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <p className="text-xs text-gray-400 text-right mt-1">
            סה"כ {projects.length} פרויקטים
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
