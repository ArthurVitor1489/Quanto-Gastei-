import { Insight, InsightRule, UserFinancialContext } from '@/types/insight';
import { colors } from '@/theme/colors';

// Rule 1: Spending Ratio > 80% of Income
export const spendingRatioRule: InsightRule = {
  id: 'spending_ratio_80',
  name: 'Limite de Gastos',
  description: 'Verifica se as despesas ultrapassaram 80% das receitas.',
  is_active: true,
  evaluate: (context: UserFinancialContext): Insight | null => {
    const { total_income, total_expense } = context;
    if (total_income <= 0) return null;

    const ratio = total_expense / total_income;
    if (ratio > 0.8) {
      const percentage = (ratio * 100).toFixed(0);
      return {
        id: 'spending_ratio_alert',
        type: 'spending',
        severity: 'warning',
        title: 'Alerta de Gastos Altos',
        description: `Você já gastou ${percentage}% da sua receita total deste mês. Considere rever despesas supérfluas.`,
        value: ratio,
        icon: 'trending-up',
        color: colors.warning,
        created_at: new Date().toISOString(),
        dismissed: false,
      };
    }

    if (ratio > 0 && ratio <= 0.5) {
      return {
        id: 'spending_ratio_good',
        type: 'spending',
        severity: 'positive',
        title: 'Gastos Controlados',
        description: 'Parabéns! Suas despesas estão abaixo de 50% de suas receitas este mês. Continue assim!',
        value: ratio,
        icon: 'check-circle',
        color: colors.success,
        created_at: new Date().toISOString(),
        dismissed: false,
      };
    }

    return null;
  },
};

// Rule 2: Low Savings Rate
export const savingsRateRule: InsightRule = {
  id: 'savings_rate_low',
  name: 'Taxa de Poupança Baixa',
  description: 'Verifica se a taxa de poupança está abaixo de 10%.',
  is_active: true,
  evaluate: (context: UserFinancialContext): Insight | null => {
    const { savings_rate } = context;
    
    if (savings_rate < 10 && savings_rate >= 0) {
      return {
        id: 'savings_rate_alert',
        type: 'spending',
        severity: 'info',
        title: 'Dica de Economia',
        description: `Sua taxa de poupança está em ${savings_rate.toFixed(1)}% este mês. Tente guardar pelo menos 10% para sua reserva de emergência.`,
        value: savings_rate,
        icon: 'lightbulb',
        color: colors.info,
        created_at: new Date().toISOString(),
        dismissed: false,
      };
    }
    
    return null;
  },
};
