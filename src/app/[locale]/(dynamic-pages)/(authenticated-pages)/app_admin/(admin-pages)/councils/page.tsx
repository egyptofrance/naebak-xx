import { Button } from "@/components/ui/button";
import { T } from "@/components/ui/Typography";
import { getCouncilsAction } from "@/data/admin/council";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { CreateCouncilDialog } from "./CreateCouncilDialog";
import { CouncilsList } from "./CouncilsList";
import { ReorderCouncilsButton } from "./ReorderCouncilsButton";

export default async function CouncilsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <T.H2>إدارة المجالس</T.H2>
          <T.P className="text-muted-foreground">
            إضافة وتعديل وترتيب المجالس النيابية في التطبيق
          </T.P>
        </div>
        <div className="flex gap-2">
          <ReorderCouncilsButton />
          <CreateCouncilDialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              إضافة مجلس جديد
            </Button>
          </CreateCouncilDialog>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <CouncilsListWrapper />
      </Suspense>
    </div>
  );
}

async function CouncilsListWrapper() {
  const result = await getCouncilsAction();
  
  if (result?.data) {
    return <CouncilsList councils={result.data.councils} />;
  }

  return <div>Failed to load councils</div>;
}

