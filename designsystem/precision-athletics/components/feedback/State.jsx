import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Button } from "../core/Button.jsx";
const cx = (...a) => a.filter(Boolean).join(" ");

export function LoadingState({ text = "Henter …", className }) {
  return <div className={cx("pa-state", "pa-state--loading", className)} role="status" aria-live="polite"><span className="pa-state__mono">{text}</span></div>;
}
export function EmptyState({ icon = "inbox", title, text, action, actionIcon = "plus", onAction, secondary, onSecondary, className }) {
  return (
    <div className={cx("pa-state", "pa-state--empty", className)}>
      <span className="pa-state__icon"><Icon name={icon} size={22} /></span>
      <div className="pa-state__text"><span className="pa-state__title">{title}</span>{text && <span className="pa-state__body">{text}</span>}</div>
      {(action || secondary) && <div className="pa-state__actions">{action && <Button variant="secondary" icon={actionIcon} onClick={onAction}>{action}</Button>}{secondary && <Button variant="ghost" onClick={onSecondary}>{secondary}</Button>}</div>}
    </div>
  );
}
export function ErrorState({ title = "Noe gikk galt", text, code, onRetry, retryLabel = "Prøv igjen", className }) {
  return (
    <div className={cx("pa-state", "pa-state--error", className)} role="alert">
      <span className="pa-state__icon"><Icon name="circle-alert" size={22} /></span>
      <div className="pa-state__text"><span className="pa-state__title">{title}</span>{text && <span className="pa-state__body">{text}</span>}</div>
      {onRetry && <div className="pa-state__actions"><Button variant="secondary" icon="rotate-cw" onClick={onRetry}>{retryLabel}</Button></div>}
      {code && <span className="pa-state__code">{code}</span>}
    </div>
  );
}
export function State({ status, loadingText, empty, error, children }) {
  if (status === "loading") return <LoadingState text={loadingText} />;
  if (status === "error") return <ErrorState {...error} />;
  if (status === "empty") return <EmptyState {...empty} />;
  return children || null;
}
