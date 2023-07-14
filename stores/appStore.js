import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({
      language: 'en',
      endpoint: 'transcriptions',
      prompt: '',
      temperature: 0.6,
      interval: 2500,
      threshold: -45,
      voice: 0,
      engine: 'openai',
      setLanguage: (lang) => set({ language: lang }),
      setEndpoint: (endpt) => set({ endpoint: endpt }),
      setPrompt: (str) => set({ prompt: str }),
      setTemperature: (temp) => set({ temperature: temp }),
      setInterval: (intval) => set({ interval: intval }),
      setThreshold: (thold) => set({ threshold: thold }),
      setVoice: (v) => set({ voice: v }),
    }),
    {
      name: 'openai-whisper-settings-storage',
      version: 0,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
