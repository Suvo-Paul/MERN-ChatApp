import { create } from "zustand";
import { createAuthSlice } from "./slices/auth-silce";

export const useAppStore = create()((...a) => ({
    ...createAuthSlice(...a)
}))