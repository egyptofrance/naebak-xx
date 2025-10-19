"use client";

import { bulkSettleInvitationsAction } from "@/data/user/invitation";
import {
  acceptTermsOfServiceAction,
  updateProfilePictureUrlAction,
  uploadPublicUserAvatarAction,
} from "@/data/user/user";
import { updateCompleteProfileAction } from "@/data/user/complete-profile";
import { createWorkspaceAction } from "@/data/user/workspaces";
import type { DBTable, WorkspaceInvitation } from "@/types";
import { getRandomCuteAvatar } from "@/utils/cute-avatars";
import type { AuthUserMetadata } from "@/utils/zod-schemas/authUserMetadata";
import {
  InferUseOptimisticActionHookReturn,
  useOptimisticAction,
} from "next-safe-action/hooks";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

export type FLOW_STATE =
  | "TERMS"
  | "PROFILE"
  | "SETUP_WORKSPACES"
  | "FINISHING_UP";

interface OnboardingContextExtendedType {
  onboardingStatus: AuthUserMetadata;
  currentStep: FLOW_STATE;
  nextStep: () => void;
  setCurrentStep: React.Dispatch<React.SetStateAction<FLOW_STATE>>;
  userProfile: DBTable<"user_profiles">;
  userEmail: string | undefined;
  profileUpdateActionState: InferUseOptimisticActionHookReturn<
    typeof updateCompleteProfileAction
  >;
  acceptTermsActionState: InferUseOptimisticActionHookReturn<
    typeof acceptTermsOfServiceAction
  >;
  createWorkspaceActionState: InferUseOptimisticActionHookReturn<
    typeof createWorkspaceAction
  >;
  uploadAvatarMutation: InferUseOptimisticActionHookReturn<
    typeof uploadPublicUserAvatarAction
  >;
  avatarURLState: string | undefined;
  flowStates: FLOW_STATE[];
  pendingInvitations: WorkspaceInvitation[];
  bulkSettleInvitationsActionState: InferUseOptimisticActionHookReturn<
    typeof bulkSettleInvitationsAction
  >;
  governorates: any[];
  parties: any[];
}

const OnboardingContextExtended = createContext<OnboardingContextExtendedType | undefined>(
  undefined,
);

export function useOnboardingExtended() {
  const context = useContext(OnboardingContextExtended);
  if (!context) {
    throw new Error("useOnboardingExtended must be used within an OnboardingProviderExtended");
  }
  return context;
}

interface OnboardingProviderExtendedProps {
  children: React.ReactNode;
  userProfile: DBTable<"user_profiles">;
  onboardingStatus: AuthUserMetadata;
  userEmail: string | undefined;
  pendingInvitations: WorkspaceInvitation[];
  governorates: any[];
  parties: any[];
}

function getAllFlowStates(onboardingStatus: AuthUserMetadata): FLOW_STATE[] {
  const {
    onboardingHasAcceptedTerms,
    onboardingHasCompletedProfile,
    onboardingHasCompletedWorkspaceSetup,
  } = onboardingStatus;
  const flowStates: FLOW_STATE[] = [];

  if (!onboardingHasAcceptedTerms) {
    flowStates.push("TERMS");
  }
  if (!onboardingHasCompletedProfile) {
    flowStates.push("PROFILE");
  }
  if (!onboardingHasCompletedWorkspaceSetup) {
    flowStates.push("SETUP_WORKSPACES");
  }
  flowStates.push("FINISHING_UP");

  return flowStates;
}

function getInitialFlowState(
  flowStates: FLOW_STATE[],
  onboardingStatus: AuthUserMetadata,
): FLOW_STATE {
  const {
    onboardingHasAcceptedTerms,
    onboardingHasCompletedProfile,
    onboardingHasCompletedWorkspaceSetup,
  } = onboardingStatus;

  if (!onboardingHasAcceptedTerms && flowStates.includes("TERMS")) {
    return "TERMS";
  }

  if (!onboardingHasCompletedProfile && flowStates.includes("PROFILE")) {
    return "PROFILE";
  }

  if (
    !onboardingHasCompletedWorkspaceSetup &&
    flowStates.includes("SETUP_WORKSPACES")
  ) {
    return "SETUP_WORKSPACES";
  }

  return "FINISHING_UP";
}

export function OnboardingProviderExtended({
  children,
  userProfile,
  onboardingStatus,
  userEmail,
  pendingInvitations,
  governorates,
  parties,
}: OnboardingProviderExtendedProps) {
  const [avatarUrl, setAvatarUrl] = useState(
    userProfile.avatar_url ?? undefined,
  );
  const toastRef = useRef<string | number | undefined>(undefined);

  const flowStates = useMemo(
    () => getAllFlowStates(onboardingStatus),
    [onboardingStatus],
  );
  const [currentStep, setCurrentStep] = useState<FLOW_STATE>(
    getInitialFlowState(flowStates, onboardingStatus),
  );

  const nextStep = useCallback(() => {
    setCurrentStep((prevStep) => {
      const currentIndex = flowStates.indexOf(prevStep);
      if (currentIndex < flowStates.length - 1) {
        return flowStates[currentIndex + 1];
      }
      return prevStep;
    });
  }, [flowStates]);

  const profileUpdateActionState = useOptimisticAction(
    updateCompleteProfileAction,
    {
      onExecute: () => {
        nextStep();
      },
      onError: () => {
        toast.error("فشل تحديث البروفايل");
      },
      currentState: null,
      updateFn: () => {
        return null;
      },
    },
  );

  const acceptTermsActionState = useOptimisticAction(
    acceptTermsOfServiceAction,
    {
      onExecute: () => {
        nextStep();
      },
      onError: () => {
        toast.error("Failed to accept terms");
      },
      currentState: null,
      updateFn: () => {
        return null;
      },
    },
  );

  const createWorkspaceActionState = useOptimisticAction(
    createWorkspaceAction,
    {
      onExecute: () => {
        nextStep();
      },
      currentState: null,
      updateFn: () => {
        return null;
      },
      onError: () => {
        toast.error("Failed to create workspace");
      },
    },
  );

  const updateProfilePictureUrlActionState = useOptimisticAction(
    updateProfilePictureUrlAction,
    {
      currentState: avatarUrl,
      updateFn: (profilePictureUrl) => {
        return profilePictureUrl;
      },
    },
  );

  const uploadAvatarMutation = useOptimisticAction(
    uploadPublicUserAvatarAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading("جاري رفع الصورة...", {
          description: "يرجى الانتظار أثناء رفع صورتك الشخصية.",
        });
      },
      currentState: avatarUrl,
      updateFn: (profilePictureUrl, { formData }) => {
        try {
          const file = formData.get("file");
          if (file instanceof File) {
            const fileUrl = URL.createObjectURL(file);
            return fileUrl;
          }
        } catch (error) {
          console.error(error);
        }
        return profilePictureUrl;
      },
      onSuccess: (response) => {
        setAvatarUrl(response.data);
        toast.success("تم رفع الصورة!", {
          description: "تم رفع صورتك الشخصية بنجاح.",
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
      onError: () => {
        toast.error("خطأ في رفع الصورة", { id: toastRef.current });
        toastRef.current = undefined;
      },
    },
  );

  const bulkSettleInvitationsActionState = useOptimisticAction(
    bulkSettleInvitationsAction,
    {
      onError: (error) => {
        toast.error("Failed to process invitations");
        console.error(error);
      },
      currentState: null,
      updateFn: () => {
        return null;
      },
    },
  );

  useEffect(() => {
    if (!userProfile.avatar_url) {
      const avatarUrl = getRandomCuteAvatar();
      updateProfilePictureUrlActionState.execute({
        profilePictureUrl: avatarUrl,
      });
    }
  }, []);

  const avatarURLState = useMemo(() => {
    if (uploadAvatarMutation.status === "executing") {
      return uploadAvatarMutation.optimisticState;
    }
    return updateProfilePictureUrlActionState.status === "executing"
      ? updateProfilePictureUrlActionState.optimisticState
      : avatarUrl;
  }, [
    updateProfilePictureUrlActionState.optimisticState,
    avatarUrl,
    updateProfilePictureUrlActionState.status,
    uploadAvatarMutation.status,
    uploadAvatarMutation.optimisticState,
  ]);

  const value: OnboardingContextExtendedType = useMemo(
    () => ({
      currentStep,
      nextStep,
      userProfile,
      userEmail,
      profileUpdateActionState,
      acceptTermsActionState,
      createWorkspaceActionState,
      flowStates,
      setCurrentStep,
      uploadAvatarMutation,
      avatarURLState,
      onboardingStatus,
      pendingInvitations,
      bulkSettleInvitationsActionState,
      governorates,
      parties,
    }),
    [
      currentStep,
      nextStep,
      userProfile,
      userEmail,
      profileUpdateActionState,
      acceptTermsActionState,
      createWorkspaceActionState,
      flowStates,
      setCurrentStep,
      uploadAvatarMutation,
      avatarURLState,
      onboardingStatus,
      pendingInvitations,
      bulkSettleInvitationsActionState,
      governorates,
      parties,
    ],
  );

  return (
    <OnboardingContextExtended.Provider value={value}>
      {children}
    </OnboardingContextExtended.Provider>
  );
}

