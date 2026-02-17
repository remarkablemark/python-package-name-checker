import type { AvailabilityResultProps } from './AvailabilityResult.types';

export default function AvailabilityResult({
  status,
  message,
  projectUrl,
  normalizedName,
}: AvailabilityResultProps) {
  if (status === 'idle' || status === 'loading') {
    return null;
  }

  if (status === 'available') {
    return (
      <div aria-live="polite" role="status">
        <p className="text-lg font-semibold text-green-600 sm:text-xl md:text-2xl dark:text-green-400">
          ✅ “{normalizedName}” is available!
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Note: Availability does not guarantee you can register this name. PyPI
          may have additional restrictions.
        </p>
      </div>
    );
  }

  if (status === 'taken') {
    return (
      <div aria-live="polite" role="status">
        <p className="text-lg font-semibold text-yellow-500 sm:text-xl md:text-2xl dark:text-yellow-400">
          ❌ “{normalizedName}” is taken
        </p>
        <a
          className="mt-2 inline-block text-sm text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          href={projectUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          View on PyPI →
        </a>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div aria-live="polite" role="status">
        <p className="text-lg font-semibold text-amber-600 sm:text-xl md:text-2xl dark:text-amber-400">
          ⚠️ {message}
        </p>
      </div>
    );
  }

  return (
    <div aria-live="polite" role="status">
      <p className="text-lg font-semibold text-red-600 sm:text-xl md:text-2xl dark:text-red-400">
        ⚠️ {message}
      </p>
    </div>
  );
}
