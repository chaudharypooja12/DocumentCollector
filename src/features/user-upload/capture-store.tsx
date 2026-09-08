"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type { Phase1RequestPayload } from "@/lib/request-link";

export type CaptureSide = "SINGLE" | "FRONT" | "BACK";

export type Phase1Capture = {
  documentId: string;
  side: CaptureSide;
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
};

type State = {
  request: Phase1RequestPayload;
  captures: Record<string, Phase1Capture>;
  status:
    | "COLLECTING"
    | "READY_FOR_PAYMENT"
    | "CHECKOUT_OPEN"
    | "VERIFYING"
    | "PAYMENT_CANCELLED"
    | "PAYMENT_FAILED"
    | "PAID"
    | "GENERATING"
    | "SUBMITTED"
    | "EXPIRED";
};

type Action =
  | { type: "SET_CAPTURE"; capture: Phase1Capture }
  | { type: "REMOVE_CAPTURE"; key: string }
  | { type: "CLEAR_CAPTURES" }
  | { type: "SET_STATUS"; status: State["status"] };

function keyFor(documentId: string, side: CaptureSide) {
  return `${documentId}:${side}`;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_CAPTURE":
      return {
        ...state,
        captures: {
          ...state.captures,
          [keyFor(action.capture.documentId, action.capture.side)]:
            action.capture,
        },
      };
    case "REMOVE_CAPTURE": {
      const captures = { ...state.captures };
      delete captures[action.key];
      return { ...state, captures };
    }
    case "CLEAR_CAPTURES":
      return { ...state, captures: {} };
    case "SET_STATUS":
      return { ...state, status: action.status };
  }
}

type CaptureContextValue = State & {
  setCapture: (
    documentId: string,
    side: CaptureSide,
    blob: Blob,
    width: number,
    height: number,
  ) => void;
  removeCapture: (documentId: string, side: CaptureSide) => void;
  clearCaptures: () => void;
  getCapture: (
    documentId: string,
    side: CaptureSide,
  ) => Phase1Capture | undefined;
  setStatus: (status: State["status"]) => void;
  isComplete: boolean;
  completed: number;
  required: number;
};

const CaptureContext = createContext<CaptureContextValue | null>(null);

export function CaptureProvider({
  request,
  children,
}: {
  request: Phase1RequestPayload;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, {
    request,
    captures: {},
    status: "COLLECTING",
  });
  const capturesRef = useRef(state.captures);

  useEffect(() => {
    capturesRef.current = state.captures;
  }, [state.captures]);

  useEffect(
    () => () => {
      Object.values(capturesRef.current).forEach((capture) =>
        URL.revokeObjectURL(capture.previewUrl),
      );
    },
    [],
  );

  useEffect(() => {
    if (
      Object.keys(state.captures).length === 0 ||
      state.status === "SUBMITTED"
    ) {
      return;
    }
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [state.captures, state.status]);

  const setCapture = useCallback(
    (
      documentId: string,
      side: CaptureSide,
      blob: Blob,
      width: number,
      height: number,
    ) => {
      const key = keyFor(documentId, side);
      const existing = capturesRef.current[key];
      if (existing) URL.revokeObjectURL(existing.previewUrl);
      dispatch({
        type: "SET_CAPTURE",
        capture: {
          documentId,
          side,
          blob,
          previewUrl: URL.createObjectURL(blob),
          width,
          height,
        },
      });
    },
    [],
  );

  const removeCapture = useCallback((documentId: string, side: CaptureSide) => {
    const key = keyFor(documentId, side);
    const existing = capturesRef.current[key];
    if (existing) URL.revokeObjectURL(existing.previewUrl);
    dispatch({ type: "REMOVE_CAPTURE", key });
  }, []);

  const clearCaptures = useCallback(() => {
    Object.values(capturesRef.current).forEach((capture) =>
      URL.revokeObjectURL(capture.previewUrl),
    );
    dispatch({ type: "CLEAR_CAPTURES" });
  }, []);

  const required = useMemo(
    () =>
      request.documents.reduce(
        (total, document) => total + (document.type === "FRONT_BACK" ? 2 : 1),
        0,
      ),
    [request.documents],
  );
  const completed = Object.keys(state.captures).length;

  const value = useMemo<CaptureContextValue>(
    () => ({
      ...state,
      setCapture,
      removeCapture,
      clearCaptures,
      getCapture: (documentId, side) =>
        state.captures[keyFor(documentId, side)],
      setStatus: (status) => dispatch({ type: "SET_STATUS", status }),
      isComplete: completed === required,
      completed,
      required,
    }),
    [state, setCapture, removeCapture, clearCaptures, completed, required],
  );

  return (
    <CaptureContext.Provider value={value}>{children}</CaptureContext.Provider>
  );
}

export function useCaptures() {
  const context = useContext(CaptureContext);
  if (!context) {
    throw new Error("useCaptures must be used inside CaptureProvider.");
  }
  return context;
}

export function captureKey(documentId: string, side: CaptureSide) {
  return keyFor(documentId, side);
}

export function requiredCaptureKeys(request: Phase1RequestPayload) {
  return request.documents.flatMap((document) =>
    document.type === "SINGLE"
      ? [keyFor(document.id, "SINGLE")]
      : [keyFor(document.id, "FRONT"), keyFor(document.id, "BACK")],
  );
}

export function isCaptureSetComplete(
  request: Phase1RequestPayload,
  captures: Record<string, Phase1Capture>,
) {
  return requiredCaptureKeys(request).every((key) => Boolean(captures[key]));
}
