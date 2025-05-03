import { supabase } from './supabaseClient';

export async function getPowerPriceForDate(date: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('power_price_oracle')
    .select('price')
    .eq('date', date)
    .maybeSingle();
  if (error || !data) return null;
  return Number(data.price);
}

export async function setPowerPriceForDate(date: string, price: number): Promise<void> {
  await supabase
    .from('power_price_oracle')
    .upsert([{ date, price }], { onConflict: 'date' });
} 