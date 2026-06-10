const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wtxbrumqmrprudpypbwd.supabase.co';
const supabaseAnonKey = 'sb_publishable_qXdpEfEvzJvdEDD7jtxMRw_XFybe82i';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, user_id, amount, description, type, date, created_at');

  if (error) {
    console.error('Erro:', error);
    return;
  }

  console.log(`Total de transações encontradas: ${data.length}`);
  data.forEach((tx) => {
    console.log(`ID: ${tx.id} | Desc: ${tx.description} | Valor: ${tx.amount} | Tipo: ${tx.type} | Data: ${tx.date} | Criado em: ${tx.created_at}`);
  });
}

checkTransactions();
