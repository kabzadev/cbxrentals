import { supabase } from './supabase';
import { trackDependency, trackException } from './appInsights';

// Wrap Supabase calls with logging
export const supabaseWithLogging = {
  from: (table: string) => {
    const startTime = Date.now();
    const originalFrom = supabase.from(table);
    
    // Wrap the select method
    const wrappedSelect = originalFrom.select.bind(originalFrom);
    originalFrom.select = (...args: any[]) => {
      const query = wrappedSelect(...args);
      
      // Wrap the promise
      const originalThen = query.then.bind(query);
      query.then = (onFulfilled?: any, onRejected?: any) => {
        return originalThen(
          (result: any) => {
            const duration = Date.now() - startTime;
            const success = !result.error;
            
            trackDependency(
              `Supabase: ${table}`,
              `SELECT from ${table}`,
              duration,
              success,
              success ? 200 : 500
            );
            
            if (result.error) {
              trackException(new Error(result.error.message), {
                table,
                operation: 'SELECT',
                code: result.error.code
              });
            }
            
            return onFulfilled ? onFulfilled(result) : result;
          },
          onRejected
        );
      };
      
      return query;
    };
    
    // Similar wrapping for insert, update, delete, etc.
    const wrappedInsert = originalFrom.insert.bind(originalFrom);
    originalFrom.insert = (...args: any[]) => {
      const query = wrappedInsert(...args);
      
      const originalThen = query.then.bind(query);
      query.then = (onFulfilled?: any, onRejected?: any) => {
        return originalThen(
          (result: any) => {
            const duration = Date.now() - startTime;
            const success = !result.error;
            
            trackDependency(
              `Supabase: ${table}`,
              `INSERT into ${table}`,
              duration,
              success,
              success ? 201 : 500
            );
            
            if (result.error) {
              trackException(new Error(result.error.message), {
                table,
                operation: 'INSERT',
                code: result.error.code
              });
            }
            
            return onFulfilled ? onFulfilled(result) : result;
          },
          onRejected
        );
      };
      
      return query;
    };
    
    return originalFrom;
  }
};

// Export the original supabase client as well
export { supabase };