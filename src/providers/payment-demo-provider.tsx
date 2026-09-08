"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  DEFAULT_DEMO_PRICES,
  MAX_DEMO_AMOUNT_MINOR,
  type DemoCountryCode,
  type DemoCountryPrice,
} from "@/lib/payment-demo";

export type DemoPriceSetting = DemoCountryPrice & {
  revision: number;
};

type State = Record<DemoCountryCode, DemoPriceSetting>;

type Action =
  | {
      type: "SET_AMOUNT";
      countryCode: DemoCountryCode;
      amountMinor: number;
    }
  | {
      type: "SET_ENABLED";
      countryCode: DemoCountryCode;
      enabled: boolean;
    }
  | { type: "RESET" };

function initialState(): State {
  return {
    IN: { ...DEFAULT_DEMO_PRICES.IN, revision: 1 },
    AE: { ...DEFAULT_DEMO_PRICES.AE, revision: 1 },
  };
}

function reducer(state: State, action: Action): State {
  if (action.type === "RESET") return initialState();
  const current = state[action.countryCode];

  if (action.type === "SET_AMOUNT") {
    if (
      !Number.isInteger(action.amountMinor) ||
      action.amountMinor < 1 ||
      action.amountMinor > MAX_DEMO_AMOUNT_MINOR ||
      action.amountMinor === current.amountMinor
    ) {
      return state;
    }
    return {
      ...state,
      [action.countryCode]: {
        ...current,
        amountMinor: action.amountMinor,
        revision: current.revision + 1,
      },
    };
  }

  return {
    ...state,
    [action.countryCode]: { ...current, enabled: action.enabled },
  };
}

type PaymentDemoContextValue = {
  prices: State;
  setAmountMinor: (
    countryCode: DemoCountryCode,
    amountMinor: number,
  ) => void;
  setEnabled: (countryCode: DemoCountryCode, enabled: boolean) => void;
  resetPrices: () => void;
};

const PaymentDemoContext = createContext<PaymentDemoContextValue | null>(null);

export function PaymentDemoProvider({ children }: { children: ReactNode }) {
  const [prices, dispatch] = useReducer(reducer, initialState());
  const value = useMemo<PaymentDemoContextValue>(
    () => ({
      prices,
      setAmountMinor: (countryCode, amountMinor) =>
        dispatch({ type: "SET_AMOUNT", countryCode, amountMinor }),
      setEnabled: (countryCode, enabled) =>
        dispatch({ type: "SET_ENABLED", countryCode, enabled }),
      resetPrices: () => dispatch({ type: "RESET" }),
    }),
    [prices],
  );

  return (
    <PaymentDemoContext.Provider value={value}>
      {children}
    </PaymentDemoContext.Provider>
  );
}

export function usePaymentDemo() {
  const context = useContext(PaymentDemoContext);
  if (!context) {
    throw new Error("usePaymentDemo must be used inside PaymentDemoProvider.");
  }
  return context;
}
