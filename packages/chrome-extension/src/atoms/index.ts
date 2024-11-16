import { atom } from "jotai";

const userIdAtom = atom<string | null>(null);

export { userIdAtom };
