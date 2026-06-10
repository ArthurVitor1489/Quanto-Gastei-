import { Insight, InsightRule, UserFinancialContext } from '@/types/insight';
import { colors } from '@/theme/colors';

// Rule: Expense growth trend (>20% increase/decrease compared to last month)
export const expenseTrendRule: InsightRule = {
  id: 'expense_trend_comparison',
  name: 'Tendência de Despesas',
  description: 'Compara a despesa do mês atual com a do anterior para detectar aumentos abruptos.',
  is_active: true,
  evaluate: (context: UserFinancialContext): Insight | null => {
    const { monthly_trend } = context;
    if (!monthly_trend || monthly_trend.length < 2) return null;

    // Assume trend is in chronological order (oldest to newest)
    const current = monthly_trend[monthly_trend.length - 1];
    const previous = monthly_trend[monthly_trend.length - 2];

    if (!current || !previous || previous.expense <= 0) return null;

    const changeRatio = (current.expense - previous.expense) / previous.expense;

    if (changeRatio > 0.2) {
      const percentage = (changeRatio * 100).toFixed(0);
      return {
        id: 'trend_alert_increase',
        type: 'trend',
        severity: 'negative',
        title: 'Aumento de Gastos',
        description: `Seus gastos subiram ${percentage}% em comparação com o mês passado (${previous.month}). Atenção para não comprometer seu orçamento.`,
        value: changeRatio,
        icon: 'trending-up',
        color: colors.expense,
        created_at: new Date().toISOString(),
        dismissed: false,
      };
    }

    if (changeRatio < -0.2) {
      const percentage = Math.abs(changeRatio * 100).toFixed(0);
      return {
        id: 'trend_alert_decrease',
        type: 'trend',
        severity: 'positive',
        title: 'Gastos em Queda',
        description: `Excelente! Suas despesas diminuíram ${percentage}% em comparação ao mês passado (${previous.month}). Ótimo controle financeiro!`,
        value: changeRatio,
        icon: 'trending-down',
        color: colors.success,
        created_at: new Date().toISOString(),
        dismissed: false,
      };
    }

    return null;
  },
};
