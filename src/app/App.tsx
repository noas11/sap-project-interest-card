import { ProjectInterestWidget } from "./components/ProjectInterestWidget";
import { useSapOpportunity } from "./hooks/useSapOpportunity";

/**
 * Reads the Opportunity ID from the URL parameter "id".
 * Example URL: ?id=03801796-6239-11f1-90bc-05cafee74142
 */
function getOpportunityIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

export default function App() {
  const opportunityId = getOpportunityIdFromUrl();
  const { projects, projectCount, isLoading, error, noPhone } = useSapOpportunity(opportunityId);

  // Loading state — render widget in neutral 0-state, no layout jump
  if (isLoading) {
    return <ProjectInterestWidget projectCount={0} projects={[]} />;
  }

  // No phone number on the opportunity — show inline message inside the card
  if (noPhone) {
    return (
      <ProjectInterestWidget
        projectCount={0}
        projects={[]}
        noPhoneMessage="לא קיים מספר טלפון על ההזדמנות הנוכחית"
      />
    );
  }

  // API error — show Hebrew error banner above the widget, widget stays intact
  if (error) {
    return (
      <>
        <div
          dir="rtl"
          className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-right mb-2"
        >
          {error}
        </div>
        <ProjectInterestWidget projectCount={0} projects={[]} />
      </>
    );
  }

  // Normal render — widget driven by live SAP data
  return <ProjectInterestWidget projectCount={projectCount} projects={projects} />;
}
