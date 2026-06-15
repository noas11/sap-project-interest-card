import { useSapOpportunity } from "../hooks/useSapOpportunity";
import { STATUS_STYLES } from "./ProjectInterestWidget";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

/**
 * Full-page project history view.
 * Opened in a new tab by ProjectInterestWidget via window.open.
 * Reads ?id= from the URL, fetches SAP data using the existing hook,
 * and renders the complete project table with no height constraints.
 */
export function ProjectHistoryPage() {
  const params = new URLSearchParams(window.location.search);
  const opportunityId = params.get("id");

  const { projects, projectCount, isLoading, error, noPhone } =
    useSapOpportunity(opportunityId);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-50 p-6 font-sans"
    >
      {/* ── Page header ── */}
      <div className="mb-5 border-b border-gray-200 pb-4">
        <h1 className="text-xl font-semibold text-gray-900">פרויקטים קודמים</h1>
        {opportunityId && (
          <p className="text-xs text-gray-400 mt-0.5">
            הזדמנות: {opportunityId}
          </p>
        )}
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <p className="text-sm text-gray-400 text-right">טוען נתונים…</p>
      )}

      {/* ── No phone ── */}
      {!isLoading && noPhone && (
        <p className="text-sm text-gray-500 text-right">
          לא קיים מספר טלפון על ההזדמנות הנוכחית
        </p>
      )}

      {/* ── API error ── */}
      {!isLoading && error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-right">
          {error}
        </div>
      )}

      {/* ── Table ── */}
      {!isLoading && !error && !noPhone && (
        <>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right font-semibold text-gray-700 py-2.5">
                    פרויקט
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 py-2.5">
                    סטטוס
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 py-2.5">
                    תאריך
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-gray-400 py-10 text-sm"
                    >
                      לא נמצאו פרויקטים קודמים
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project, idx) => (
                    <TableRow
                      key={project.id}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        idx % 2 === 1 ? "bg-gray-50/60" : ""
                      }`}
                    >
                      <TableCell className="text-right font-medium text-gray-800 py-3">
                        {project.project}
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${
                            STATUS_STYLES[project.status] ??
                            "bg-gray-50 border-gray-200 text-gray-600"
                          }`}
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
          </div>

          <p className="text-xs text-gray-400 text-right mt-3">
            סה"כ {projectCount} פרויקטים
          </p>
        </>
      )}
    </div>
  );
}
