/** Minimum length when complexity rules apply (signup, password reset). */
export const MIN_PASSWORD_LENGTH = 8;

export type PasswordPolicyFailure =
  | "too_short"
  | "missing_upper"
  | "missing_lower"
  | "missing_number"
  | "missing_special";

export function getPasswordPolicyFailures(password: string): PasswordPolicyFailure[] {
  const failures: PasswordPolicyFailure[] = [];
  if (password.length < MIN_PASSWORD_LENGTH) failures.push("too_short");
  if (!/[A-Z]/.test(password)) failures.push("missing_upper");
  if (!/[a-z]/.test(password)) failures.push("missing_lower");
  if (!/[0-9]/.test(password)) failures.push("missing_number");
  if (!/[^A-Za-z0-9]/.test(password)) failures.push("missing_special");
  return failures;
}

export function isPasswordPolicyValid(password: string): boolean {
  return getPasswordPolicyFailures(password).length === 0;
}

/** i18n key shown when password does not meet policy. */
export const PASSWORD_POLICY_MESSAGE_KEY = "signup.passwordRequirements";
