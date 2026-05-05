import { getSupabaseClient } from './supabase-safe';
import { User } from '@supabase/supabase-js';

// Types for user data
export interface SavedRate {
  id: string;
  user_id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  created_at: string;
  updated_at: string;
}

export interface RateAlert {
  id: string;
  user_id: string;
  from_currency: string;
  to_currency: string;
  target_rate: number;
  condition: 'above' | 'below';
  is_active: boolean;
  notified: boolean;
  created_at: string;
  updated_at: string;
}

export interface MultiCurrencyConverterHistory {
  id: string;
  user_id: string;
  from_currency: string;
  amount: number;
  target_currencies: any[];
  conversion_results: any;
  created_at: string;
}

export interface MathCalculatorHistory {
  id: string;
  user_id: string;
  expression: string;
  result: number;
  created_at: string;
}

export interface PickedRate {
  id: string;
  user_id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  interaction_type: 'viewed' | 'copied' | 'converted' | 'calculated';
  context: any;
  created_at: string;
}

// Helper function to handle table not found errors
const handleTableNotFound = (tableName: string, error: any) => {
  if (error.code === 'PGRST205') {
    console.warn(`⚠️ Database table '${tableName}' not found. Please run the migration script as described in SUPABASE-SETUP-GUIDE.md`);
    return true;
  }
  return false;
};

// User data service class
export class UserDataService {
  private static getUserId(): string | null {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    
    const user = supabase.auth.getUser();
    return user ? user.id : null;
  }

  // Saved Rates CRUD operations
  static async saveRate(fromCurrency: string, toCurrency: string, rate: number): Promise<SavedRate | null> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('saved_rates')
        .insert({
          user_id: user.id,
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate: rate
        })
        .select()
        .single();

      if (error) {
        if (!handleTableNotFound('saved_rates', error)) {
          console.error('Error saving rate:', error);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in saveRate:', error);
      return null;
    }
  }

  static async getSavedRates(): Promise<SavedRate[]> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_rates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (!handleTableNotFound('saved_rates', error)) {
          console.error('Error fetching saved rates:', error);
        }
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSavedRates:', error);
      return [];
    }
  }

  static async deleteSavedRate(id: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated for deleteSavedRate');
        return false;
      }

      console.log('Attempting to delete saved rate:', { id, user_id: user.id });

      const { data, error } = await supabase
        .from('saved_rates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id'); // Get back the ID of deleted row(s)

      if (error) {
        console.error('Supabase delete error:', error);
        if (!handleTableNotFound('saved_rates', error)) {
          console.error('Error deleting saved rate:', error);
        }
        return false;
      }

      // Check if any rows were actually deleted
      const deletedRows = data?.length || 0;
      console.log('Delete operation completed:', { deletedRows, expected: 1 });

      return deletedRows > 0;
    } catch (error) {
      console.error('Error in deleteSavedRate:', error);
      return false;
    }
  }

  static async deleteAllSavedRates(): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('saved_rates')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        if (!handleTableNotFound('saved_rates', error)) {
          console.error('Error deleting all saved rates:', error);
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteAllSavedRates:', error);
      return false;
    }
  }

  // Rate Alerts CRUD operations
  static async createRateAlert(
    fromCurrency: string,
    toCurrency: string,
    targetRate: number,
    condition: 'above' | 'below'
  ): Promise<RateAlert | null> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('rate_alerts')
        .insert({
          user_id: user.id,
          from_currency: fromCurrency,
          to_currency: toCurrency,
          target_rate: targetRate,
          condition: condition,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        if (!handleTableNotFound('rate_alerts', error)) {
          console.error('Error creating rate alert:', error);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createRateAlert:', error);
      return null;
    }
  }

  static async getRateAlerts(): Promise<RateAlert[]> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('rate_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (!handleTableNotFound('rate_alerts', error)) {
          console.error('Error fetching rate alerts:', error);
        }
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRateAlerts:', error);
      return [];
    }
  }

  static async updateRateAlert(
    id: string,
    updates: Partial<Pick<RateAlert, 'target_rate' | 'condition' | 'is_active' | 'notified'>>
  ): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('rate_alerts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        if (!handleTableNotFound('rate_alerts', error)) {
          console.error('Error updating rate alert:', error);
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateRateAlert:', error);
      return false;
    }
  }

  static async deleteRateAlert(id: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('rate_alerts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        if (!handleTableNotFound('rate_alerts', error)) {
          console.error('Error deleting rate alert:', error);
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteRateAlert:', error);
      return false;
    }
  }

  // Multi-Currency Converter History
  static async saveConverterHistory(
    fromCurrency: string,
    amount: number,
    targetCurrencies: any[],
    conversionResults: any
  ): Promise<MultiCurrencyConverterHistory | null> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // First, try to update existing record for this user
      const { data: updateData, error: updateError } = await supabase
        .from('multi_currency_converter_history')
        .update({
          from_currency: fromCurrency,
          amount: amount,
          target_currencies: targetCurrencies,
          conversion_results: conversionResults
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        // If update failed (likely no existing record), insert new record
        if (updateError.code === 'PGRST116') { // No rows found to update
          const { data: insertData, error: insertError } = await supabase
            .from('multi_currency_converter_history')
            .insert({
              user_id: user.id,
              from_currency: fromCurrency,
              amount: amount,
              target_currencies: targetCurrencies,
              conversion_results: conversionResults
            })
            .select()
            .single();

          if (insertError) {
            if (!handleTableNotFound('multi_currency_converter_history', insertError)) {
              console.error('Error inserting converter history:', insertError);
            }
            return null;
          }

          return insertData;
        } else {
          if (!handleTableNotFound('multi_currency_converter_history', updateError)) {
            console.error('Error updating converter history:', updateError);
          }
          return null;
        }
      }

      return updateData;
    } catch (error) {
      console.error('Error in saveConverterHistory:', error);
      return null;
    }
  }

  static async getConverterHistory(limit: number = 50): Promise<MultiCurrencyConverterHistory[]> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('multi_currency_converter_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        if (!handleTableNotFound('multi_currency_converter_history', error)) {
          console.error('Error fetching converter history:', error);
        }
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getConverterHistory:', error);
      return [];
    }
  }

  static async deleteConverterHistory(id: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('multi_currency_converter_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        if (!handleTableNotFound('multi_currency_converter_history', error)) {
          console.error('Error deleting converter history:', error);
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteConverterHistory:', error);
      return false;
    }
  }

  // Math Calculator History
  static async saveCalculatorHistory(
    expression: string,
    result: number,
    calculationType: string = 'basic',
    metadata: any = null
  ): Promise<MathCalculatorHistory | null> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Ensure expression is not null or empty
      if (!expression || expression.trim() === '') {
        console.warn('Cannot save calculator history: expression is null or empty');
        return null;
      }

      // Insert the new record (using the actual column name 'expression')
      const { data, error } = await supabase
        .from('math_calculator_history')
        .insert({
          user_id: user.id,
          expression: expression.trim(),
          result: result,
        })
        .select()
        .single();

      if (error) {
        if (!handleTableNotFound('math_calculator_history', error)) {
          console.error('Error saving calculator history:', error);
        }
        return null;
      }

      // Check if we need to clean up old records (keep only 15 most recent)
      const { count, error: countError } = await supabase
        .from('math_calculator_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (!countError && count && count > 15) {
        // Get the IDs of records to delete (all except the 15 most recent)
        const { data: recordsToDelete, error: selectError } = await supabase
          .from('math_calculator_history')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(15, count - 1);

        if (!selectError && recordsToDelete && recordsToDelete.length > 0) {
          const idsToDelete = recordsToDelete.map((record: { id: string }) => record.id);

          const { error: deleteError } = await supabase
            .from('math_calculator_history')
            .delete()
            .eq('user_id', user.id)
            .in('id', idsToDelete);

          if (deleteError) {
            console.warn('Error cleaning up old calculator history:', deleteError);
            // Don't fail the save operation if cleanup fails
          } else {
            console.log(`Cleaned up ${idsToDelete.length} old calculator history records`);
          }
        }
      }

      return data;
    } catch (error) {
      console.error('Error in saveCalculatorHistory:', error);
      return null;
    }
  }

  static async getCalculatorHistory(limit: number = 15): Promise<MathCalculatorHistory[]> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Select with expression column
      const { data, error } = await supabase
        .from('math_calculator_history')
        .select('id, user_id, expression, result, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        if (!handleTableNotFound('math_calculator_history', error)) {
          console.error('Error fetching calculator history:', error);
        }
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCalculatorHistory:', error);
      return [];
    }
  }

  static async deleteCalculatorHistory(id: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('math_calculator_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        if (!handleTableNotFound('math_calculator_history', error)) {
          console.error('Error deleting calculator history:', error);
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCalculatorHistory:', error);
      return false;
    }
  }

  static async clearAllCalculatorHistory(): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('math_calculator_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        if (!handleTableNotFound('math_calculator_history', error)) {
          console.error('Error clearing calculator history:', error);
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearAllCalculatorHistory:', error);
      return false;
    }
  }

  // Picked Rates tracking
  static async trackPickedRate(
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    interactionType: 'viewed' | 'copied' | 'converted' | 'calculated' = 'viewed',
    context: any = null
  ): Promise<PickedRate | null> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('picked_rates')
        .insert({
          user_id: user.id,
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate: rate,
          interaction_type: interactionType,
          context: context
        })
        .select()
        .single();

      if (error) {
        if (!handleTableNotFound('picked_rates', error)) {
          console.error('Error tracking picked rate:', error);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in trackPickedRate:', error);
      return null;
    }
  }

  static async getPickedRates(limit: number = 100): Promise<PickedRate[]> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('picked_rates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        if (!handleTableNotFound('picked_rates', error)) {
          console.error('Error fetching picked rates:', error);
        }
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPickedRates:', error);
      return [];
    }
  }

  static async deletePickedRate(id: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('picked_rates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        if (!handleTableNotFound('picked_rates', error)) {
          console.error('Error deleting picked rate:', error);
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deletePickedRate:', error);
      return false;
    }
  }

  // Utility methods
  static async clearAllUserData(): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const tables = ['saved_rates', 'rate_alerts', 'multi_currency_converter_history', 'math_calculator_history', 'picked_rates'];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', user.id);

        if (error) {
          if (!handleTableNotFound(table, error)) {
            console.error(`Error clearing data from ${table}:`, error);
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error in clearAllUserData:', error);
      return false;
    }
  }
}