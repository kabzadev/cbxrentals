import { useState } from 'react'
import { testSupabaseConnection } from '../lib/supabase'
import { testDatabaseConnection } from '../lib/supabase-test'

export function TestSupabase() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleBasicTest = async () => {
    setStatus('testing')
    setMessage('Testing basic connection...')
    
    const success = await testSupabaseConnection()
    
    if (success) {
      setStatus('success')
      setMessage('Basic connection successful! ✅')
    } else {
      setStatus('error')
      setMessage('Basic connection failed! Check console for details.')
    }
  }

  const handleFullTest = async () => {
    setStatus('testing')
    setMessage('Running full database tests...')
    
    const success = await testDatabaseConnection()
    
    if (success) {
      setStatus('success')
      setMessage('All database tests passed! ✅')
    } else {
      setStatus('error')
      setMessage('Database tests failed! Check console for details.')
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={handleBasicTest}
            disabled={status === 'testing'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Basic Connection
          </button>
          
          <button
            onClick={handleFullTest}
            disabled={status === 'testing'}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Run Full Database Test
          </button>
        </div>
        
        {message && (
          <div className={`p-3 rounded ${
            status === 'success' ? 'bg-green-100 text-green-800' :
            status === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {message}
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p>Note: Make sure you've:</p>
          <ol className="list-decimal list-inside ml-4">
            <li>Run the database migrations in Supabase</li>
            <li>Added your Supabase anon key to .env.local</li>
            <li>Restarted the dev server after adding the env variable</li>
          </ol>
        </div>
      </div>
    </div>
  )
}