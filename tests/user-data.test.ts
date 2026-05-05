import { UserDataService } from '../lib/userDataService';
import { useUserData } from '../hooks/useUserData';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock dependencies
jest.mock('../lib/supabase-safe', () => ({
  getSupabaseClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  })),
}));

describe('UserDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Saved Rates', () => {
    test('should save a rate successfully', async () => {
      const mockSavedRate = {
        id: 'test-id',
        user_id: 'test-user-id',
        from_currency: 'USD',
        to_currency: 'EUR',
        rate: 0.85,
        created_at: '2025-11-13T21:00:00Z',
        updated_at: '2025-11-13T21:00:00Z',
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })),
        },
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockSavedRate, error: null })),
            })),
          })),
        })),
      };

      const { getSupabaseClient } = require('../lib/supabase-safe');
      getSupabaseClient.mockReturnValue(mockSupabase);

      const result = await UserDataService.saveRate('USD', 'EUR', 0.85);
      
      expect(result).toEqual(mockSavedRate);
      expect(mockSupabase.from).toHaveBeenCalledWith('saved_rates');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        from_currency: 'USD',
        to_currency: 'EUR',
        rate: 0.85,
      });
    });

    test('should fetch saved rates successfully', async () => {
      const mockSavedRates = [
        {
          id: 'test-id-1',
          user_id: 'test-user-id',
          from_currency: 'USD',
          to_currency: 'EUR',
          rate: 0.85,
          created_at: '2025-11-13T21:00:00Z',
          updated_at: '2025-11-13T21:00:00Z',
        },
      ];

      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: mockSavedRates, error: null })),
            })),
          })),
        })),
      };

      const { getSupabaseClient } = require('../lib/supabase-safe');
      getSupabaseClient.mockReturnValue(mockSupabase);

      const result = await UserDataService.getSavedRates();
      
      expect(result).toEqual(mockSavedRates);
      expect(result).toHaveLength(1);
      expect(result[0].from_currency).toBe('USD');
    });

    test('should delete a saved rate successfully', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })),
        },
        from: jest.fn(() => ({
          delete: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null })),
          })),
        })),
      };

      const { getSupabaseClient } = require('../lib/supabase-safe');
      getSupabaseClient.mockReturnValue(mockSupabase);

      const result = await UserDataService.deleteSavedRate('test-id');
      
      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('saved_rates');
    });
  });

  describe('Rate Alerts', () => {
    test('should create a rate alert successfully', async () => {
      const mockRateAlert = {
        id: 'test-alert-id',
        user_id: 'test-user-id',
        from_currency: 'USD',
        to_currency: 'EUR',
        target_rate: 0.90,
        condition: 'above',
        is_active: true,
        created_at: '2025-11-13T21:00:00Z',
        updated_at: '2025-11-13T21:00:00Z',
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })),
        },
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockRateAlert, error: null })),
            })),
          })),
        })),
      };

      const { getSupabaseClient } = require('../lib/supabase-safe');
      getSupabaseClient.mockReturnValue(mockSupabase);

      const result = await UserDataService.createRateAlert('USD', 'EUR', 0.90, 'above');
      
      expect(result).toEqual(mockRateAlert);
      expect(mockSupabase.from).toHaveBeenCalledWith('rate_alerts');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        from_currency: 'USD',
        to_currency: 'EUR',
        target_rate: 0.90,
        condition: 'above',
        is_active: true,
      });
    });

    test('should fetch rate alerts successfully', async () => {
      const mockRateAlerts = [
        {
          id: 'test-alert-id',
          user_id: 'test-user-id',
          from_currency: 'USD',
          to_currency: 'EUR',
          target_rate: 0.90,
          condition: 'above',
          is_active: true,
          created_at: '2025-11-13T21:00:00Z',
          updated_at: '2025-11-13T21:00:00Z',
        },
      ];

      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: mockRateAlerts, error: null })),
            })),
          })),
        })),
      };

      const { getSupabaseClient } = require('../lib/supabase-safe');
      getSupabaseClient.mockReturnValue(mockSupabase);

      const result = await UserDataService.getRateAlerts();
      
      expect(result).toEqual(mockRateAlerts);
      expect(result).toHaveLength(1);
      expect(result[0].condition).toBe('above');
    });
  });

  describe('Multi-Currency Converter History', () => {
    test('should save converter history successfully', async () => {
      const mockHistoryRecord = {
        id: 'test-history-id',
        user_id: 'test-user-id',
        from_currency: 'USD',
        amount: 100,
        target_currencies: [
          { currency: 'EUR', amount: 85, rate: 0.85 },
          { currency: 'GBP', amount: 73, rate: 0.73 },
        ],
        conversion_results: { EUR: 85, GBP: 73 },
        created_at: '2025-11-13T21:00:00Z',
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })),
        },
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockHistoryRecord, error: null })),
            })),
          })),
        })),
      };

      const { getSupabaseClient } = require('../lib/supabase-safe');
      getSupabaseClient.mockReturnValue(mockSupabase);

      const targetCurrencies = [
        { currency: 'EUR', amount: 85, rate: 0.85 },
        { currency: 'GBP', amount: 73, rate: 0.73 },
      ];

      const result = await UserDataService.saveConverterHistory('USD', 100, targetCurrencies, { EUR: 85, GBP: 73 });
      
      expect(result).toEqual(mockHistoryRecord);
      expect(mockSupabase.from).toHaveBeenCalledWith('multi_currency_converter_history');
    });
  });

  describe('Math Calculator History', () => {
    test('should save calculator history successfully', async () => {
      const mockCalculatorHistory = {
        id: 'test-calc-id',
        user_id: 'test-user-id',
        calculation_expression: '10 + 5 = 15',
        result: 15,
        calculation_type: 'basic',
        metadata: { roundingDecimalPlaces: 2 },
        created_at: '2025-11-13T21:00:00Z',
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })),
        },
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockCalculatorHistory, error: null })),
            })),
          })),
        })),
      };

      const { getSupabaseClient } = require('../lib/supabase-safe');
      getSupabaseClient.mockReturnValue(mockSupabase);

      const result = await UserDataService.saveCalculatorHistory('10 + 5', 15, 'basic', { roundingDecimalPlaces: 2 });
      
      expect(result).toEqual(mockCalculatorHistory);
      expect(mockSupabase.from).toHaveBeenCalledWith('math_calculator_history');
    });
  });

  describe('Picked Rates', () => {
    test('should track a picked rate successfully', async () => {
      const mockPickedRate = {
        id: 'test-picked-id',
        user_id: 'test-user-id',
        from_currency: 'USD',
        to_currency: 'EUR',
        rate: 0.85,
        interaction_type: 'viewed',
        context: { timestamp: Date.now() },
        created_at: '2025-11-13T21:00:00Z',
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })),
        },
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockPickedRate, error: null })),
            })),
          })),
        })),
      };

      const { getSupabaseClient } = require('../lib/supabase-safe');
      getSupabaseClient.mockReturnValue(mockSupabase);

      const result = await UserDataService.trackPickedRate('USD', 'EUR', 0.85, 'viewed', { timestamp: Date.now() });
      
      expect(result).toEqual(mockPickedRate);
      expect(mockSupabase.from).toHaveBeenCalledWith('picked_rates');
    });
  });

  describe('Data Management', () => {
    test('should clear all user data successfully', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })),
        },
        from: jest.fn(() => ({
          delete: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null })),
          })),
        })),
      };

      const tables = ['saved_rates', 'rate_alerts', 'multi_currency_converter_history', 'math_calculator_history', 'picked_rates'];
      
      const { getSupabaseClient } = require('../lib/supabase-safe');
      getSupabaseClient.mockReturnValue(mockSupabase);

      const result = await UserDataService.clearAllUserData();
      
      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenBeenCalledTimes(tables.length);
      
      // Verify each table was called
      tables.forEach(table => {
        expect(mockSupabase.from).toHaveBeenCalledWith(table);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle save rate error gracefully', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })),
        },
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } })),
            })),
          })),
        })),
      };

      const { getSupabaseClient } = require('../lib/supabase-safe');
      getSupabaseClient.mockReturnValue(mockSupabase);

      const result = await UserDataService.saveRate('USD', 'EUR', 0.85);
      
      expect(result).toBeNull();
    });

    test('should handle unauthenticated user', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: null } })),
        },
      };

      const { getSupabaseClient } = require('../lib/supabase-safe');
      getSupabaseClient.mockReturnValue(mockSupabase);

      const result = await UserDataService.getSavedRates();
      
      expect(result).toEqual([]);
    });
  });
});

describe('User Data Hooks', () => {
  test('useSavedRates should provide expected interface', async () => {
    const { result } = renderHook(() => useSavedRates());
    
    expect(result.current).toHaveProperty('savedRates');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('saveRate');
    expect(result.current).toHaveProperty('deleteRate');
    expect(result.current).toHaveProperty('deleteAllRates');
    expect(result.current).toHaveProperty('refreshRates');
    
    expect(Array.isArray(result.current.savedRates)).toBe(true);
    expect(typeof result.current.loading).toBe('boolean');
    expect(typeof result.current.error).toBe('string');
    expect(typeof result.current.saveRate).toBe('function');
    expect(typeof result.current.deleteRate).toBe('function');
    expect(typeof result.current.deleteAllRates).toBe('function');
    expect(typeof result.current.refreshRates).toBe('function');
  });

  test('useRateAlerts should provide expected interface', async () => {
    const { result } = renderHook(() => useRateAlerts());
    
    expect(result.current).toHaveProperty('rateAlerts');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('createAlert');
    expect(result.current).toHaveProperty('updateAlert');
    expect(result.current).toHaveProperty('deleteAlert');
    expect(result.current).toHaveProperty('refreshAlerts');
    
    expect(Array.isArray(result.current.rateAlerts)).toBe(true);
    expect(typeof result.current.loading).toBe('boolean');
    expect(typeof result.current.error).toBe('string');
    expect(typeof result.current.createAlert).toBe('function');
    expect(typeof result.current.updateAlert).toBe('function');
    expect(typeof result.current.deleteAlert).toBe('function');
    expect(typeof result.current.refreshAlerts).toBe('function');
  });

  test('useConverterHistory should provide expected interface', async () => {
    const { result } = renderHook(() => useConverterHistory());
    
    expect(result.current).toHaveProperty('converterHistory');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('saveConversion');
    expect(result.current).toHaveProperty('deleteConversion');
    expect(result.current).toHaveProperty('refreshHistory');
    
    expect(Array.isArray(result.current.converterHistory)).toBe(true);
    expect(typeof result.current.loading).toBe('boolean');
    expect(typeof result.current.error).toBe('string');
    expect(typeof result.current.saveConversion).toBe('function');
    expect(typeof result.current.deleteConversion).toBe('function');
    expect(typeof result.current.refreshHistory).toBe('function');
  });

  test('useCalculatorHistory should provide expected interface', async () => {
    const { result } = renderHook(() => useCalculatorHistory());
    
    expect(result.current).toHaveProperty('calculatorHistory');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('saveCalculation');
    expect(result.current).toHaveProperty('deleteCalculation');
    expect(result.current).toHaveProperty('clearAllCalculations');
    expect(result.current).toHaveProperty('refreshHistory');
    
    expect(Array.isArray(result.current.calculatorHistory)).toBe(true);
    expect(typeof result.current.loading).toBe('boolean');
    expect(typeof result.current.error).toBe('string');
    expect(typeof result.current.saveCalculation).toBe('function');
    expect(typeof result.current.deleteCalculation).toBe('function');
    expect(typeof result.current.clearAllCalculations).toBe('function');
    expect(typeof result.current.refreshHistory).toBe('function');
  });

  test('usePickedRates should provide expected interface', async () => {
    const { result } = renderHook(() => usePickedRates());
    
    expect(result.current).toHaveProperty('pickedRates');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('trackRate');
    expect(result.current).toHaveProperty('deletePickedRate');
    expect(result.current).toHaveProperty('refreshPickedRates');
    
    expect(Array.isArray(result.current.pickedRates)).toBe(true);
    expect(typeof result.current.loading).toBe('boolean');
    expect(typeof result.current.error).toBe('string');
    expect(typeof result.current.trackRate).toBe('function');
    expect(typeof result.current.deletePickedRate).toBe('function');
    expect(typeof result.current.refreshPickedRates).toBe('function');
  });

  test('useUserData should provide combined interface', async () => {
    const { result } = renderHook(() => useUserData());
    
    expect(result.current).toHaveProperty('savedRates');
    expect(result.current).toHaveProperty('rateAlerts');
    expect(result.current).toHaveProperty('converterHistory');
    expect(result.current).toHaveProperty('calculatorHistory');
    expect(result.current).toHaveProperty('pickedRates');
    expect(result.current).toHaveProperty('clearAllData');
    
    expect(typeof result.current.clearAllData).toBe('function');
  });
});