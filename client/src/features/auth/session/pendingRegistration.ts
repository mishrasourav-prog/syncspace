const PENDING_REGISTRATION_EMAIL_KEY =
  "syncspace:pending-registration-email";

export function savePendingRegistrationEmail(
  email: string
): void {
  window.sessionStorage.setItem(
    PENDING_REGISTRATION_EMAIL_KEY,
    email
      .trim()
      .toLowerCase()
  );
}

export function readPendingRegistrationEmail(): string | null {
  const email =
    window.sessionStorage.getItem(
      PENDING_REGISTRATION_EMAIL_KEY
    );

  return email &&
    email.trim().length > 0
    ? email
        .trim()
        .toLowerCase()
    : null;
}

export function clearPendingRegistrationEmail(): void {
  window.sessionStorage.removeItem(
    PENDING_REGISTRATION_EMAIL_KEY
  );
}
