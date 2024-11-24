import { atomWithStorage } from "jotai/utils";

type UserInfo = {
  location: "local" | "google";
  userId: string;
};

// Create an atom that syncs with local storage
const userIdAtom = atomWithStorage<UserInfo | null>("userId", null);

export { userIdAtom };
