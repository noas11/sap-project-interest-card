import { useState, useEffect } from "react";

export interface SapProject {
  id: string;
  date: string;
  status: string;
  project: string;
}

interface UseSapOpportunityResult {
  projects: SapProject[];
  projectCount: number;
  isLoading: boolean;
  error: string | null;
  /** True when the opportunity exists but has no z_phone value */
  noPhone: boolean;
}

/**
 * Formats a raw ISO/SAP date string to DD/MM/YYYY for display.
 * Returns the raw value unchanged if it cannot be parsed.
 */
function formatDate(raw: string | null | undefined): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Fetches opportunities from SAP Sales Cloud V2 and returns a sorted,
 * filtered list of related projects for the given opportunity ID.
 *
 * Flow:
 *  1. GET /opportunity/{opportunityId}           → extract currentId + z_phone
 *  2. Validate z_phone — if absent, set noPhone=true, skip further calls
 *  3. GET /opportunities?$filter=z_phone eq "…" → related list (raw phone, no encoding)
 *  4. Exclude current opportunity by id (compared against API response id, not URL)
 *  5. Sort DESC by startDate
 *  6. Map to SapProject shape
 */
export function useSapOpportunity(opportunityId: string | null): UseSapOpportunityResult {
  const [projects, setProjects] = useState<SapProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noPhone, setNoPhone] = useState<boolean>(false);

  useEffect(() => {
    if (!opportunityId) {
      setProjects([]);
      setIsLoading(false);
      setError(null);
      setNoPhone(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      const SAP_BASE = import.meta.env.VITE_SAP_BASE_URL ?? "";
      setIsLoading(true);
      setError(null);
      setNoPhone(false);

      try {
        // ── Step 1: Load current opportunity ─────────────────────────────────
        const currentRes = await fetch(
          `${SAP_BASE}/sap/c4c/api/v1/opportunity-service/opportunities/${encodeURIComponent(opportunityId)}`
        );

        if (!currentRes.ok) {
          throw new Error(`HTTP ${currentRes.status} when loading opportunity`);
        }

        const currentData = await currentRes.json();
        const currentOpportunityId: string = currentData?.value?.id;
        const phoneNumber: string | null | undefined =
          currentData?.value?.extensions?.z_phone;

        // ── Step 2: Validate phone number ─────────────────────────────────────
        // Fix 5: distinguish "no phone" from other empty results
        if (!phoneNumber || phoneNumber.trim() === "") {
          if (!cancelled) {
            setNoPhone(true);
            setProjects([]);
            setIsLoading(false);
          }
          return;
        }

        // ── Step 3: Search related opportunities ──────────────────────────────
        // Fix 3: use the phone number value directly — no encodeURIComponent
        const searchRes = await fetch(
          `${SAP_BASE}/sap/c4c/api/v1/opportunity-service/opportunities?$filter=extensions/z_phone eq "${phoneNumber}"`
        );

        if (!searchRes.ok) {
          throw new Error(`HTTP ${searchRes.status} when searching opportunities`);
        }

        const searchData = await searchRes.json();

        // Fix 4: support both searchData.value and searchData.items
        const allOpportunities: unknown[] =
          Array.isArray(searchData?.value)
            ? searchData.value
            : Array.isArray(searchData?.items)
            ? searchData.items
            : [];

        // ── Step 4: Exclude current opportunity ───────────────────────────────
        // Compare against the id from Step 1, NOT the URL param
        const related = allOpportunities.filter(
          (item: any) => item?.id !== currentOpportunityId
        );

        // ── Step 5 & 6: Sort DESC by startDate, then map to display shape ─────
        const sorted: SapProject[] = related
          .sort((a: any, b: any) => {
            const da = a?.startDate ? new Date(a.startDate).getTime() : 0;
            const db = b?.startDate ? new Date(b.startDate).getTime() : 0;
            return db - da; // newest first
          })
          .map((item: any, idx: number) => ({
            id: item?.id ?? String(idx),
            date: formatDate(item?.startDate),
            status: item?.statusDescription ?? "",
            project: item?.extensions?.Z_projectdescription ?? "",
          }));

        if (!cancelled) {
          setProjects(sorted);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[useSapOpportunity] API error:", err);
        if (!cancelled) {
          setError("לא ניתן לטעון נתוני פרויקטים קודמים");
          setProjects([]);
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [opportunityId]);

  return {
    projects,
    projectCount: projects.length,
    isLoading,
    error,
    noPhone,
  };
}
