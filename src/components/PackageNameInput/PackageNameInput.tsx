import Spinner from 'src/components/Spinner';

import type { PackageNameInputProps } from './PackageNameInput.types';

export default function PackageNameInput({
  inputValue,
  status,
  onChange,
}: PackageNameInputProps) {
  return (
    <div className="relative w-full max-w-[700px]">
      <label className="sr-only" htmlFor="package-name-input">
        Package name
      </label>
      <input
        autoComplete="off"
        spellCheck="false"
        className="placeholder-light w-full rounded-lg border border-slate-300 px-4 py-3 text-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:px-6 sm:py-4 sm:text-3xl md:px-8 md:py-5 md:text-4xl lg:text-5xl dark:border-gray-600 dark:bg-gray-800 dark:text-slate-100 dark:ring-blue-400"
        id="package-name-input"
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder="Python package name"
        type="text"
        value={inputValue}
      />
      {status === 'loading' && (
        <div className="absolute top-1/2 right-4 -translate-y-1/2 sm:right-6 md:right-8">
          <Spinner className="h-6 w-6 text-slate-400 sm:h-8 sm:w-8" />
        </div>
      )}
    </div>
  );
}
