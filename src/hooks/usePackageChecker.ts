import { useEffect, useRef, useState } from 'react';
import type { AvailabilityStatus, PackageCheckerState } from 'src/types/pypi';
import checkPyPI from 'src/utils/checkPyPI';
import normalizePackageName from 'src/utils/normalizePackageName';

const DEBOUNCE_MS = 300;

interface UsePackageCheckerReturn extends PackageCheckerState {
  onChange: (value: string) => void;
}

/**
 * Orchestrates debounce, validation, normalization, fetch, and cancellation
 * for checking Python package name availability on PyPI.
 */
export default function usePackageChecker(): UsePackageCheckerReturn {
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<AvailabilityStatus>('idle');
  const [message, setMessage] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [normalizedName, setNormalizedName] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = inputValue.trim();

    if (!trimmed) {
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    const timer = setTimeout(() => {
      const normalized = normalizePackageName(trimmed);
      setNormalizedName(normalized);
      setStatus('loading');

      checkPyPI(normalized, controller.signal)
        .then((result) => {
          if (result.status === 'taken') {
            setStatus('taken');
            setMessage('');
            setProjectUrl(result.projectUrl);
          } else if (result.status === 'available') {
            setStatus('available');
            setMessage('');
            setProjectUrl('');
          } else {
            setStatus('error');
            setMessage(result.message);
            setProjectUrl('');
          }
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }
          setStatus('error');
          setMessage('Something went wrong, please try again');
          setProjectUrl('');
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [inputValue]);

  const handleChange = (value: string) => {
    setInputValue(value);
    if (!value.trim()) {
      controllerRef.current?.abort();
      setStatus('idle');
      setMessage('');
      setProjectUrl('');
      setNormalizedName('');
    }
  };

  return {
    inputValue,
    status,
    message,
    projectUrl,
    normalizedName,
    onChange: handleChange,
  };
}
