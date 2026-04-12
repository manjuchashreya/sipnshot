import { AppShell } from "@/components/app-shell";
import { OnboardingFlow } from "@/components/onboarding-flow";

export default function HomePage() {
  return (
    <AppShell>
      <OnboardingFlow />
    </AppShell>
  );
}
