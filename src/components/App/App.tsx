import AvailabilityResult from 'src/components/AvailabilityResult';
import PackageNameInput from 'src/components/PackageNameInput';
import usePackageChecker from 'src/hooks/usePackageChecker';

export default function App() {
  const { inputValue, status, message, projectUrl, normalizedName, onChange } =
    usePackageChecker();

  return (
    <main className="flex min-h-screen flex-col items-center px-4">
      <div className="h-[30vh] shrink-0 sm:h-[35vh]" />

      <h1 className="mb-8 text-center text-3xl font-bold text-slate-800 sm:text-4xl md:mb-12 md:text-5xl">
        Python Package Name Checker
      </h1>

      <PackageNameInput
        inputValue={inputValue}
        onChange={onChange}
        status={status}
      />

      <div className="mt-6 text-center md:mt-8">
        <AvailabilityResult
          message={message}
          normalizedName={normalizedName}
          projectUrl={projectUrl}
          status={status}
        />
      </div>
    </main>
  );
}
