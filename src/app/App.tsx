import { ProjectInterestWidget } from "./components/ProjectInterestWidget";
import { ProjectHistoryPage }   from "./components/ProjectHistoryPage";
import { useSapOpportunity }    from "./hooks/useSapOpportunity";

/**
 * Reads a named URL parameter from the current page URL.
 */
function getParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Top-level router — no library needed.
 *
 * ?page=history  →  ProjectHistoryPage  (opened in a new tab by the widget)
 * (anything else) →  ProjectInterestWidget  (the compact Mashup card)
 */
export default function App() {
  const page = getParam("page");

  // ── Full-page history view (new tab) ─────────────────────────────────────
  if (page === "history") {
    return <ProjectHistoryPage />;
  }

  // ── Compact Mashup card ───────────────────────────────────────────────────
  return <MashupCard />;
}

function MashupCard() {
  const opportunityId = getParam("id");
  const { projectCount, isLoading, error, noPhone } = useSapOpportunity(opportunityId);

  if (isLoading) {
    return <ProjectInterestWidget projectCount={0} opportunityId={null} />;
  }

  if (noPhone) {
    return (
      <ProjectInterestWidget
        projectCount={0}
        opportunityId={null}
        noPhoneMessage="לא קיים מספר טלפון על ההזדמנות הנוכחית"
      />
    );
  }

  if (error) {
    return (
      <>
        <div
          dir="rtl"
          className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-right mb-2"
        >
          {error}
        </div>
        <ProjectInterestWidget projectCount={0} opportunityId={null} />
      </>
    );
  }

  return (
    <ProjectInterestWidget
      projectCount={projectCount}
      opportunityId={opportunityId}
    />
  );
}
