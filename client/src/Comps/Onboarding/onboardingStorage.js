const STORAGE_KEY = "onboarding_done_v2";

export const shouldShowOnboarding = () =>
  !localStorage.getItem(STORAGE_KEY);

export const markOnboardingDone = () =>
  localStorage.setItem(STORAGE_KEY, "1");
