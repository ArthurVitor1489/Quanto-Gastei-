import { getDB, generateUUID } from '@/lib/sqlite';
import { CreditCard, CreditCardFormData } from '@/types/creditCard';

/**
 * Maps a SQLite database row to the CreditCard interface
 */
const mapRowToCreditCard = (row: any): CreditCard => {
  return {
    id: row.id,
    name: row.name,
    closing_day: Number(row.closing_day),
    due_day: Number(row.due_day),
    limit_amount: row.limit_amount !== null ? Number(row.limit_amount) : null,
    created_at: row.created_at,
  };
};

/**
 * Fetches all credit cards from local SQLite database.
 */
export const getCreditCards = async (): Promise<CreditCard[]> => {
  const db = getDB();
  try {
    const rows = await db.getAllAsync<any>('SELECT * FROM credit_cards ORDER BY name ASC');
    return rows.map(mapRowToCreditCard);
  } catch (error) {
    console.error('Error fetching credit cards from SQLite:', error);
    throw error;
  }
};

/**
 * Fetches a single credit card by ID.
 */
export const getCreditCard = async (id: string): Promise<CreditCard | null> => {
  const db = getDB();
  try {
    const row = await db.getFirstAsync<any>('SELECT * FROM credit_cards WHERE id = ?', [id]);
    if (!row) return null;
    return mapRowToCreditCard(row);
  } catch (error) {
    console.error('Error fetching credit card from SQLite:', error);
    throw error;
  }
};

/**
 * Creates a new credit card in SQLite.
 */
export const createCreditCard = async (cardData: CreditCardFormData): Promise<CreditCard> => {
  const db = getDB();
  const id = generateUUID();
  const limit = cardData.limit_amount ? Number(cardData.limit_amount) : null;

  try {
    await db.runAsync(
      'INSERT INTO credit_cards (id, name, closing_day, due_day, limit_amount) VALUES (?, ?, ?, ?, ?)',
      [id, cardData.name, cardData.closing_day, cardData.due_day, limit]
    );

    const created = await getCreditCard(id);
    if (!created) throw new Error('Failed to retrieve created credit card');
    return created;
  } catch (error) {
    console.error('Error creating credit card in SQLite:', error);
    throw error;
  }
};

/**
 * Updates a credit card in SQLite.
 */
export const updateCreditCard = async (
  id: string,
  cardData: Partial<CreditCardFormData>
): Promise<CreditCard> => {
  const db = getDB();
  try {
    const existing = await getCreditCard(id);
    if (!existing) throw new Error('Credit card not found');

    const name = cardData.name !== undefined ? cardData.name : existing.name;
    const closing_day = cardData.closing_day !== undefined ? cardData.closing_day : existing.closing_day;
    const due_day = cardData.due_day !== undefined ? cardData.due_day : existing.due_day;
    const limit_amount = cardData.limit_amount !== undefined 
      ? (cardData.limit_amount ? Number(cardData.limit_amount) : null) 
      : existing.limit_amount;

    await db.runAsync(
      'UPDATE credit_cards SET name = ?, closing_day = ?, due_day = ?, limit_amount = ? WHERE id = ?',
      [name, closing_day, due_day, limit_amount, id]
    );

    const updated = await getCreditCard(id);
    if (!updated) throw new Error('Failed to retrieve updated credit card');
    return updated;
  } catch (error) {
    console.error('Error updating credit card in SQLite:', error);
    throw error;
  }
};

/**
 * Deletes a credit card from SQLite.
 */
export const deleteCreditCard = async (id: string): Promise<void> => {
  const db = getDB();
  try {
    await db.runAsync('DELETE FROM credit_cards WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting credit card from SQLite:', error);
    throw error;
  }
};
