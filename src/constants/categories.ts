/**
 * Quanto Gastei? - Default Categories
 * Pre-configured expense categories and investment subcategories.
 */

interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface InvestmentSubcategory {
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: readonly DefaultCategory[] = [
  {
    name: 'Alimentação',
    icon: 'restaurant',
    color: '#F85149',
    sort_order: 1,
  },
  {
    name: 'Transporte',
    icon: 'directions-car',
    color: '#58A6FF',
    sort_order: 2,
  },
  {
    name: 'Casa',
    icon: 'home',
    color: '#D29922',
    sort_order: 3,
  },
  {
    name: 'Saúde',
    icon: 'favorite',
    color: '#2EA043',
    sort_order: 4,
  },
  {
    name: 'Lazer',
    icon: 'sports-esports',
    color: '#A371F7',
    sort_order: 5,
  },
  {
    name: 'Bike',
    icon: 'pedal-bike',
    color: '#3FB950',
    sort_order: 6,
  },
  {
    name: 'Educação',
    icon: 'school',
    color: '#79C0FF',
    sort_order: 7,
  },
  {
    name: 'Outros',
    icon: 'more-horiz',
    color: '#8B949E',
    sort_order: 8,
  },
  {
    name: 'Investimentos',
    icon: 'trending-up',
    color: '#F7931A',
    sort_order: 9,
  },
] as const;

export const INVESTMENT_SUBCATEGORIES: readonly InvestmentSubcategory[] = [
  {
    name: 'Renda Fixa',
    icon: 'account-balance',
    color: '#58A6FF',
  },
  {
    name: 'Ações',
    icon: 'show-chart',
    color: '#2EA043',
  },
  {
    name: 'FIIs',
    icon: 'apartment',
    color: '#D29922',
  },
  {
    name: 'Criptomoedas',
    icon: 'currency-bitcoin',
    color: '#F7931A',
  },
  {
    name: 'Tesouro Direto',
    icon: 'savings',
    color: '#A371F7',
  },
] as const;

/**
 * Returns the category color by name (case-insensitive).
 */
export const getCategoryColor = (name: string): string => {
  const category = DEFAULT_CATEGORIES.find(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  );
  return category?.color ?? '#8B949E';
};
