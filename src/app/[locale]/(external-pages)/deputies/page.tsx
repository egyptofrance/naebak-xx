import { getAllDeputies } from "@/app/actions/deputy/getAllDeputies";
import DeputiesGrid from "./DeputiesGrid";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export default async function DeputiesPage() {
  const deputies = await getAllDeputies();
  
  // Check if user is authenticated
  const supabase = await createSupabaseUserServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">قائمة النواب</h1>
          
          <DeputiesGrid deputies={deputies} isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </div>
  );
}

