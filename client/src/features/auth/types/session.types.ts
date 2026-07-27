export type SessionRevocationReason =
  | "logout"
  | "password_changed"
  | "password_reset"
  | "account_deleted";

export interface SessionRevokedPayload {
  reason: SessionRevocationReason;
}
