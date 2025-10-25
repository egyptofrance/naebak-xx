import { getAllDeputies } from "@/app/actions/deputy/getAllDeputies";

export default async function TestDeputiesPage() {
  console.log('[TestDeputiesPage] Starting...');
  
  const startTime = Date.now();
  const deputies = await getAllDeputies();
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('[TestDeputiesPage] Got', deputies.length, 'deputies in', duration, 'ms');

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Test Deputies Data</h1>
      
      <div className="bg-blue-100 border border-blue-400 rounded p-4 mb-4">
        <h2 className="font-bold text-lg mb-2">Debug Info:</h2>
        <p><strong>Total deputies:</strong> {deputies.length}</p>
        <p><strong>Query duration:</strong> {duration}ms</p>
        <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
        <p><strong>Environment:</strong></p>
        <ul className="list-disc ml-6">
          <li>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</li>
          <li>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</li>
        </ul>
      </div>
      
      {deputies.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">First 5 Deputies:</h2>
          {deputies.slice(0, 5).map((deputy, index) => (
            <div key={deputy.deputy.id} className="border p-4 rounded bg-white">
              <h3 className="font-bold text-lg mb-2">
                #{index + 1}: {deputy.user?.full_name || 'No name'}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Status:</strong> {deputy.deputy.deputy_status}</div>
                <div><strong>Governorate:</strong> {deputy.governorate?.name_ar || 'N/A'}</div>
                <div><strong>Party:</strong> {deputy.party?.name_ar || 'N/A'}</div>
                <div><strong>Council:</strong> {deputy.council?.name_ar || 'N/A'}</div>
                <div><strong>District:</strong> {deputy.electoral_district?.name || 'N/A'}</div>
                <div><strong>Slug:</strong> {deputy.slug || 'N/A'}</div>
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600">Show full data</summary>
                <pre className="text-xs overflow-auto mt-2 bg-gray-100 p-2 rounded">
                  {JSON.stringify(deputy, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-red-100 border border-red-400 rounded p-4">
          <p className="text-red-700 font-bold">❌ No deputies found!</p>
          <p className="text-sm mt-2">This means getAllDeputies() returned an empty array.</p>
          <p className="text-sm">Check Vercel logs for server-side errors.</p>
        </div>
      )}
    </div>
  );
}

