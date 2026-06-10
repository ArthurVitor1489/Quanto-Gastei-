import { InsightRule } from '@/types/insight';
import { spendingRatioRule, savingsRateRule } from './spendingRules';
import { expenseTrendRule } from './trendRules';
import { cryptoConcentrationRule, idleCashRule } from './portfolioRules';

export const ALL_INSIGHT_RULES: InsightRule[] = [
  spendingRatioRule,
  savingsRateRule,
  expenseTrendRule,
  cryptoConcentrationRule,
  idleCashRule,
];
