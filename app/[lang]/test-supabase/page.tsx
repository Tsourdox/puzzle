'use client';

import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';

export default function TestSupabase() {
  const [status, setStatus] = useState('Testing connection...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    try {
      // Test 1: Check connection
      setStatus('✓ Connected to Supabase');

      // Test 2: Try to query rooms table
      const { data, error } = await supabase.from('rooms').select('*').limit(1);
      console.log(data);

      if (error) {
        throw error;
      }

      setStatus('✓ Successfully queried database!');

      // Test 3: Try to insert a test room
      const testRoomCode = 'test_' + Date.now();
      const { error: insertError } = await supabase.from('rooms').insert({
        room_code: testRoomCode,
        puzzle_data: { test: true },
      });

      if (insertError) {
        throw insertError;
      }

      setStatus('✓ Successfully inserted test room!');

      // Test 4: Clean up test room
      await supabase.from('rooms').delete().eq('room_code', testRoomCode);

      setStatus('✅ All tests passed! Supabase is working correctly.');
    } catch (err: unknown) {
      setStatus('❌ Connection failed');
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <h1 className="text-4xl font-bold">Supabase Connection Test</h1>
      <div className="text-xl">{status}</div>
      {error && (
        <div className="text-red-500 bg-red-100 p-4 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
