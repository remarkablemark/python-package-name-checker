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
        <p className="text-lg font-semibold text-green-600 sm:text-xl md:text-2xl">
          ✅ &quot;{normalizedName}&quot; is available!
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Note: Availability does not guarantee you can register this name. PyPI
          may have additional restrictions.
        </p>
      </div>
    );
  }

  if (status === 'taken') {
    return (
      <div aria-live="polite" role="status">
        <p className="text-lg font-semibold text-red-600 sm:text-xl md:text-2xl">
          ❌ &quot;{normalizedName}&quot; is taken
        </p>
        <a
          className="mt-2 inline-block text-sm text-blue-600 underline hover:text-blue-800"
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
        <p className="text-lg font-semibold text-amber-600 sm:text-xl md:text-2xl">
          ⚠️ {message}
        </p>
      </div>
    );
  }

  return (
    <div aria-live="polite" role="status">
      <p className="text-lg font-semibold text-red-600 sm:text-xl md:text-2xl">
        ⚠️ {message}
      </p>
    </div>
  );
}
