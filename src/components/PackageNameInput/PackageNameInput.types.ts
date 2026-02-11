import type { AvailabilityStatus } from 'src/types/pypi';

interface PackageNameInputProps {
  inputValue: string;
  status: AvailabilityStatus;
  onChange: (value: string) => void;
}

export type { PackageNameInputProps };
