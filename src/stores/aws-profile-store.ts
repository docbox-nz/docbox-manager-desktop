import { create } from "zustand";

export interface AwsProfileStore {
  profile: string;
  setProfile: (value: string) => void;
}

export const useAwsProfileStore = create<AwsProfileStore>((set) => ({
  profile: "default",
  setProfile(value) {
    set({ profile: value });
  },
}));
