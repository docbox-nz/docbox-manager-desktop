import { create } from "zustand";

export interface TenantFiltersStore {
  /** Filter based on a search query for the name */
  query: string;

  /** Filter to specific tenant environments */
  environments: string[];

  setQuery: (value: string) => void;
  setEnvironments: (values: string[]) => void;
}

export const useTenantFiltersStore = create<TenantFiltersStore>((set) => ({
  query: "",
  environments: [],

  setQuery(value) {
    set({ query: value });
  },

  setEnvironments(values) {
    set({ environments: values });
  },
}));
