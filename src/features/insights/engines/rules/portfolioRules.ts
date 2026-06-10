import { Insight, InsightRule, UserFinancialContext } from '@/types/insight';
import { colors } from '@/theme/colors';

export interface PortfolioFinancialContext extends UserFinancialContext {
  crypto_percentage?: number;
  cash_percentage?: number;
}

// Rule: High crypto concentration (>50% of portfolio value is in crypto assets)
export const cryptoConcentrationRule: InsightRule = {
  id: 'crypto_concentration_high',
  name: 'Concentração de Criptoativos',
  description: 'Mapeia se a alocação em criptoativos ultrapassa 50% do portfólio total.',
  is_active: true,
  evaluate: (context: UserFinancialContext): Insight | null => {
    const portfolioCtx = context as PortfolioFinancialContext;
    const cryptoPercent = portfolioCtx.crypto_percentage ?? 0;

    if (cryptoPercent > 50) {
      return {
        id: 'portfolio_risk_crypto',
        type: 'portfolio',
        severity: 'warning',
        title: 'Exposição Alta em Cripto',
        description: `Seu patrimônio possui ${cryptoPercent.toFixed(0)}% em criptoativos. Por ser um mercado muito volátil, considere diversificar para reduzir riscos.`,
        value: cryptoPercent,
        icon: 'warning',
        color: colors.warning,
        created_at: new Date().toISOString(),
        dismissed: false,
      };
    }

    return null;
  },
};

// Rule: Excess idle cash (>80% of portfolio is in cash/fiat currency)
export const idleCashRule: InsightRule = {
  id: 'idle_cash_high',
  name: 'Dinheiro Ocioso',
  description: 'Alerta quando mais de 80% do portfólio está retido em caixa ou fiat, gerando perda inflacionária.',
  is_active: true,
  evaluate: (context: UserFinancialContext): Insight | null => {
    const portfolioCtx = context as PortfolioFinancialContext;
    const cashPercent = portfolioCtx.cash_percentage ?? 0;

    if (cashPercent > 80 && context.portfolio_value > 1000) {
      return {
        id: 'portfolio_idle_cash',
        type: 'portfolio',
        severity: 'info',
        title: 'Capital Ocioso em Caixa',
        description: `Você possui ${cashPercent.toFixed(0)}% de seu patrimônio em caixa. Para proteger seu dinheiro contra a inflação, considere alocar parte disso em investimentos de baixo risco.`,
        value: cashPercent,
        icon: 'savings',
        color: colors.info,
        created_at: new Date().toISOString(),
        dismissed: false,
      };
    }

    return null;
  },
};
