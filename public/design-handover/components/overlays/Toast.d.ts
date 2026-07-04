import * as React from "react";
export type ToastTone = "success" | "warning" | "error" | "info" | "neutral";
export interface ToastOptions { title: string; description?: string; tone?: ToastTone; duration?: number; }
export declare function toast(opts: ToastOptions | string): void;
export declare function useToast(): (opts: ToastOptions | string) => void;
export declare function ToastProvider(props: { children: React.ReactNode }): JSX.Element;
