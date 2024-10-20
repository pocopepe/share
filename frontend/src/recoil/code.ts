import { atom } from 'recoil';

export const codeLanguageAtom=atom<string>({
    key:'codeLanguageAtom',
    default: 'python'
})

export const codeValueAtom = atom<string>({
    key: 'codeValueAtom', 
    default: "",
});

export const codeFileNameAtom = atom<string>({
    key:"codeFileNameAtome",
    default:""});
    
