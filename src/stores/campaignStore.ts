import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CampaignStep, Section, SectionMode } from '@/types/email-editor';

interface CampaignState {
  // Campaign-level data
  campaignId: string | null;
  campaignName: string;

  // Steps data - key is stepId
  steps: Record<string, CampaignStep & {
    needsSync: boolean;
    lastModified: string;
  }>;

  // Actions
  setCampaign: (campaignId: string, campaignName: string) => void;
  loadStepsFromServer: (serverSteps: CampaignStep[]) => void;
  updateStep: (stepId: string, updates: Partial<CampaignStep>) => void;
  removeStep: (stepId: string) => void;
  updateCurrentStepContent: (
    stepId: string,
    sections: Section[],
    subject: { mode: SectionMode; content: string; selectedFields?: string[] }
  ) => void;
  getUnsyncedSteps: () => (CampaignStep & { needsSync: boolean; lastModified: string })[];
  markStepsSynced: (stepIds: string[]) => void;
  clearCampaign: () => void;
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      // Initial state
      campaignId: null,
      campaignName: '',
      steps: {},

      setCampaign: (campaignId: string, campaignName: string) => {
        set({ campaignId, campaignName });
      },

      loadStepsFromServer: (serverSteps: CampaignStep[]) => {
        const currentSteps = get().steps;

        // Merge server data with local changes
        // Local changes take precedence (needsSync = true)
        const mergedSteps: Record<string, any> = {};

        serverSteps.forEach(serverStep => {
          const localStep = currentSteps[serverStep.id];
          mergedSteps[serverStep.id] = localStep?.needsSync
            ? localStep // Keep local changes
            : { ...serverStep, needsSync: false, lastModified: new Date().toISOString() };
        });

        set({ steps: mergedSteps });
      },

      updateStep: (stepId: string, updates: Partial<CampaignStep>) => {
        set(state => ({
          steps: {
            ...state.steps,
            [stepId]: {
              ...state.steps[stepId],
              ...updates,
              needsSync: true,
              lastModified: new Date().toISOString()
            }
          }
        }));
      },

      removeStep: (stepId: string) => {
        set(state => {
          const updatedSteps = { ...state.steps };
          delete updatedSteps[stepId];
          return { steps: updatedSteps };
        });
      },

      updateCurrentStepContent: (
        stepId: string,
        sections: Section[],
        subject: { mode: SectionMode; content: string; selectedFields?: string[] }
      ) => {
        set(state => ({
          steps: {
            ...state.steps,
            [stepId]: {
              ...state.steps[stepId],
              sections,
              subject,
              needsSync: true,
              lastModified: new Date().toISOString()
            }
          }
        }));
      },

      getUnsyncedSteps: () => {
        const steps = get().steps;
        return Object.values(steps).filter(step => step.needsSync);
      },

      markStepsSynced: (stepIds: string[]) => {
        set(state => {
          const updatedSteps = { ...state.steps };
          stepIds.forEach(stepId => {
            if (updatedSteps[stepId]) {
              updatedSteps[stepId] = {
                ...updatedSteps[stepId],
                needsSync: false
              };
            }
          });
          return { steps: updatedSteps };
        });
      },

      clearCampaign: () => {
        set({ campaignId: null, campaignName: '', steps: {} });
      }
    }),
    {
      name: 'campaign-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist steps data, not campaign metadata (loaded fresh)
      partialize: (state) => ({
        steps: state.steps
      })
    }
  )
);

// Helper hooks for specific use cases
export const useCurrentStep = (stepId: string | null) => {
  return useCampaignStore(state =>
    stepId ? state.steps[stepId] : null
  );
};

export const useUnsyncedCount = () => {
  return useCampaignStore(state => state.getUnsyncedSteps().length);
};

export const useCampaignSteps = () => {
  return useCampaignStore(state => Object.values(state.steps));
};
