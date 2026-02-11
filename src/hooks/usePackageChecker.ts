import { useEffect, useRef, useState } from 'react';
import type { AvailabilityStatus, PackageCheckerState } from 'src/types/pypi';
import checkPyPI from 'src/utils/checkPyPI';
import normalizePackageName from 'src/utils/normalizePackageName';
import validatePackageName from 'src/utils/validatePackageName';

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

    const timer = setTimeout(async () => {
      const validation = validatePackageName(trimmed);
      if (!validation.valid) {
        setStatus('invalid');
        setMessage(validation.message);
        setProjectUrl('');
        setNormalizedName('');
        return;
      }

      const normalized = normalizePackageName(trimmed);
      setNormalizedName(normalized);
      setStatus('loading');

      const result = await checkPyPI(normalized, controller.signal);

      switch (result.status) {
        case 'taken':
          setStatus('taken');
          setMessage('');
          setProjectUrl(result.projectUrl);
          break;

        case 'available':
          setStatus('available');
          setMessage('');
          setProjectUrl('');
          break;

        default:
          setStatus('error');
          setMessage(result.message);
          setProjectUrl('');
          break;
      }
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
