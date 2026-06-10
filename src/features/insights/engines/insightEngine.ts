import { Insight, UserFinancialContext } from '@/types/insight';
import { ALL_INSIGHT_RULES } from './rules';

/**
 * Runs the active ruleset against a user's financial context
 * and returns all generated insights.
 */
export const evaluateFinancialContext = (
  context: UserFinancialContext
): Insight[] => {
  const insights: Insight[] = [];

  for (const rule of ALL_INSIGHT_RULES) {
    if (rule.is_active) {
      try {
        const insight = rule.evaluate(context);
        if (insight) {
          insights.push(insight);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    }
  }

  return insights;
};
