import { SlimWorkspaces } from "@/types";
import { Fragment } from "react";
import { WorkspaceSwitcher } from "./workspace-switcher";

type Props = {
  workspaceId?: string;
  slimWorkspaces?: SlimWorkspaces;
};

export function SwitcherAndToggle({ workspaceId, slimWorkspaces }: Props) {
  return (
    <Fragment>
      {workspaceId && slimWorkspaces ? (
        <WorkspaceSwitcher
          currentWorkspaceId={workspaceId}
          slimWorkspaces={slimWorkspaces}
        />
      ) : null}
    </Fragment>
  );
}
