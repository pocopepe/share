import { atom } from 'recoil';

export const codeLanguageAtom = atom<string>({
    key: 'codeLanguageAtom',
    default: 'python',
});

export const codeValueAtom = atom<string>({
    key: 'codeValueAtom', 
    default: "",
});

export const codeFileNameAtom = atom<string>({
    key: "codeFileNameAtom",
    default: "",
});

export const isAlertVisibleAtom = atom<string>({
    key: "isAlertVisibleAtom",
    default: "0",
});

// Atom to store the isCodesharePage boolean
export const isCodesharePageAtom = atom<boolean>({
    key: 'isCodesharePageAtom',
    default: false,
});
