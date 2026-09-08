"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DocumentType } from "@/lib/request-link";

export type TemplateDocument = {
  id: string;
  name: string;
  type: DocumentType;
};

export type DocumentTemplate = {
  id: string;
  name: string;
  documents: TemplateDocument[];
};

const defaultTemplates: DocumentTemplate[] = [
  {
    id: "template-passport-photo",
    name: "Passport & Photograph",
    documents: [
      {
        id: "00000000-0000-4000-8000-000000000001",
        name: "Passport",
        type: "FRONT_BACK",
      },
      {
        id: "00000000-0000-4000-8000-000000000002",
        name: "Photograph",
        type: "SINGLE",
      },
    ],
  },
];

type TemplatesContextValue = {
  templates: DocumentTemplate[];
  addTemplate: (template: Omit<DocumentTemplate, "id">) => DocumentTemplate;
  updateTemplate: (
    id: string,
    template: Omit<DocumentTemplate, "id">,
  ) => void;
  removeTemplate: (id: string) => void;
};

const TemplatesContext = createContext<TemplatesContextValue | null>(null);

export function TemplatesProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] =
    useState<DocumentTemplate[]>(defaultTemplates);

  const addTemplate = useCallback(
    (template: Omit<DocumentTemplate, "id">) => {
      const created: DocumentTemplate = { id: crypto.randomUUID(), ...template };
      setTemplates((current) => [...current, created]);
      return created;
    },
    [],
  );

  const updateTemplate = useCallback(
    (id: string, template: Omit<DocumentTemplate, "id">) => {
      setTemplates((current) =>
        current.map((item) => (item.id === id ? { id, ...template } : item)),
      );
    },
    [],
  );

  const removeTemplate = useCallback((id: string) => {
    setTemplates((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo<TemplatesContextValue>(
    () => ({ templates, addTemplate, updateTemplate, removeTemplate }),
    [templates, addTemplate, updateTemplate, removeTemplate],
  );

  return (
    <TemplatesContext.Provider value={value}>
      {children}
    </TemplatesContext.Provider>
  );
}

export function useTemplates() {
  const context = useContext(TemplatesContext);
  if (!context) {
    throw new Error("useTemplates must be used inside TemplatesProvider.");
  }
  return context;
}
