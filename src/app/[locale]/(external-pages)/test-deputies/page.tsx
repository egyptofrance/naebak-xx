import { getAllDeputies } from "@/app/actions/deputy/getAllDeputies";

export default async function TestDeputiesPage() {
  const deputies = await getAllDeputies();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Test Deputies Data</h1>
      <p className="text-lg mb-4">Total deputies: {deputies.length}</p>
      
      {deputies.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">First 5 Deputies:</h2>
          {deputies.slice(0, 5).map((deputy, index) => (
            <div key={deputy.deputy.id} className="border p-4 rounded">
              <h3 className="font-bold">#{index + 1}</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(deputy, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-red-500">No deputies found!</p>
      )}
    </div>
  );
}

