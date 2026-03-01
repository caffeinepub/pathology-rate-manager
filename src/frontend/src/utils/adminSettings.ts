export const ADMIN_MOBILE_KEY = "pathology_admin_mobile";
export const ADMIN_PASSWORD_OVERRIDE_KEY = "pathology_admin_password_override";

export function getAdminMobile(): string | null {
  return localStorage.getItem(ADMIN_MOBILE_KEY);
}

export function setAdminMobile(mobile: string): void {
  localStorage.setItem(ADMIN_MOBILE_KEY, mobile);
}

export function getPasswordOverride(): string | null {
  return localStorage.getItem(ADMIN_PASSWORD_OVERRIDE_KEY);
}

export function setPasswordOverride(password: string): void {
  localStorage.setItem(ADMIN_PASSWORD_OVERRIDE_KEY, password);
}
