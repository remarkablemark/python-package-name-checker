import type { AvailabilityStatus } from 'src/types/pypi';

interface AvailabilityResultProps {
  status: AvailabilityStatus;
  message: string;
  projectUrl: string;
  normalizedName: string;
}

export type { AvailabilityResultProps };
