import { create } from 'zustand'

export interface PrintFile {
  id: string;
  url: string;
  fileName: string;
  fileSizeMb: string;
  pageCount: number;
  pagesToPrint: string;
  originalFile?: File;
  fileBuffer?: ArrayBuffer;
}

interface PrintState {
  files: PrintFile[];
  setFiles: (files: PrintFile[]) => void;
  updatePageRange: (id: string, range: string) => void;
  clearFiles: () => void;
}

export const usePrintStore = create<PrintState>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
  updatePageRange: (id, range) => set((state) => ({
    files: state.files.map(f => f.id === id ? { ...f, pagesToPrint: range } : f)
  })),
  clearFiles: () => set({ files: [] })
}))
