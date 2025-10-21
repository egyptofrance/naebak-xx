import { Button } from "@/components/ui/button";
import { T } from "@/components/ui/Typography";
import { getPartiesAction } from "@/data/admin/party";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { CreatePartyDialog } from "./CreatePartyDialog";
import { PartiesList } from "./PartiesList";

export default async function PartiesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <T.H2>إدارة الأحزاب</T.H2>
          <T.P className="text-muted-foreground">
            إضافة وتعديل وترتيب الأحزاب السياسية في التطبيق
          </T.P>
        </div>
        <CreatePartyDialog>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            إضافة حزب جديد
          </Button>
        </CreatePartyDialog>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <PartiesListWrapper />
      </Suspense>
    </div>
  );
}

async function PartiesListWrapper() {
  const result = await getPartiesAction();
  
  if (result?.data) {
    return <PartiesList parties={result.data.parties} />;
  }

  return <div>Failed to load parties</div>;
}

