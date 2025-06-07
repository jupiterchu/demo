import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';

export const createServerSupabaseClient = cache(() =>
  createServerComponentClient({ cookies })
);

export async function getSession() {
  const supabase = createServerSupabaseClient();
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getUserDetails() {
  const supabase = createServerSupabaseClient();
  try {
    const { data: userDetails, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
    
    // 返回第一条记录，如果没有数据则返回 null
    return userDetails && userDetails.length > 0 ? userDetails[0] : null;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getSubscriptions() {
  const supabase = createServerSupabaseClient();
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .order('created', { ascending: false });
    
    if (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
    
    // 返回所有活跃订阅，按创建时间降序排列
    return subscriptions || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// 保留原函数以向后兼容，但现在它返回最新的订阅
export async function getSubscription() {
  const subscriptions = await getSubscriptions();
  return subscriptions.length > 0 ? subscriptions[0] : null;
}

export const getActiveProductsWithPrices = async () => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { foreignTable: 'prices' });

  if (error) {
    console.log(error.message);
  }
  return data ?? [];
};
