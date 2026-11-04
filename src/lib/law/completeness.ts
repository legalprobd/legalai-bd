import { OFFENCE_INGREDIENTS } from "./ingredients";

export interface CompletenessReport {
  overallScore: number;
  totalRequiredIngredients: number;
  answeredIngredients: number;
  missingIngredients: string[];
  perSectionBreakdown: Record<string, {
    required: string[];
    answered: string[];
    missing: string[];
    percent: number;
  }>;
}

/**
 * Computes deterministic completeness score: (answered_required_elements / total_required) * 100
 */
export function computeCompleteness(laws: string[], answeredFields: Set<string>): number {
  const required = new Set<string>();
  for (const s of laws) {
    const ing = OFFENCE_INGREDIENTS[s];
    if (ing) {
      ing.required.forEach((f) => required.add(f));
    }
  }

  // Base essentials required in any court pleading (date/time, place, complainant, accused)
  ["incident_date_time", "incident_place", "accused_identity"].forEach((b) => required.add(b));

  if (required.size === 0) return 0;
  const done = [...required].filter((f) => answeredFields.has(f)).length;
  return Math.min(100, Math.round((done / required.size) * 100));
}

/**
 * Provides comprehensive details on what is missing for each applicable legal section
 */
export function getCompletenessReport(laws: string[], answeredFields: Set<string>): CompletenessReport {
  const allRequired = new Set<string>();
  const perSection: Record<string, {
    required: string[];
    answered: string[];
    missing: string[];
    percent: number;
  }> = {};

  for (const s of laws) {
    const ing = OFFENCE_INGREDIENTS[s];
    if (ing) {
      const req = ing.required;
      req.forEach((r) => allRequired.add(r));
      const answered = req.filter((r) => answeredFields.has(r));
      const missing = req.filter((r) => !answeredFields.has(r));
      perSection[s] = {
        required: req,
        answered,
        missing,
        percent: req.length > 0 ? Math.round((answered.length / req.length) * 100) : 100,
      };
    }
  }

  ["incident_date_time", "incident_place", "accused_identity"].forEach((b) => allRequired.add(b));

  const missingAll = [...allRequired].filter((f) => !answeredFields.has(f));
  const doneCount = allRequired.size - missingAll.length;
  const score = allRequired.size > 0 ? Math.round((doneCount / allRequired.size) * 100) : 0;

  return {
    overallScore: Math.min(100, score),
    totalRequiredIngredients: allRequired.size,
    answeredIngredients: doneCount,
    missingIngredients: missingAll,
    perSectionBreakdown: perSection,
  };
}
