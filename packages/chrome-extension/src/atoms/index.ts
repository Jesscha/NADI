import { atomWithStorage } from "jotai/utils";

// Create an atom that syncs with local storage
const userIdAtom = atomWithStorage<string | null>("userId", null);

export { userIdAtom };
