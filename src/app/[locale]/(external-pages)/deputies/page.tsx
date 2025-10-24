import { getAllDeputies } from "@/app/actions/deputy/getAllDeputies";
import DeputiesGrid from "./DeputiesGrid";

export default async function DeputiesPage() {
  const deputies = await getAllDeputies();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">قائمة النواب</h1>
          
          <DeputiesGrid deputies={deputies} />
        </div>
      </div>
    </div>
  );
}

