/**
 * usePrediction.js — Custom hook for managing the full prediction flow.
 *
 * State:
 *   selectedFile   — the File object the user picked
 *   previewUrl     — local object URL for displaying the original image
 *   isLoading      — true while the API call is in flight
 *   result         — the prediction response from the backend
 *   error          — error message string if something failed
 *
 * Actions:
 *   selectFile     — call with a File to stage it for prediction
 *   removeFile     — clear the staged file
 *   runPrediction  — trigger the API call
 *   reset          — return to initial empty state
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { predictDefects } from '../services/api';

export function usePrediction() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Keep a ref to revoke object URLs to avoid memory leaks
  const objectUrlRef = useRef(null);

  // Clean up the object URL when it changes or the component unmounts
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const selectFile = useCallback((file) => {
    if (!file) return;

    // Clean up previous preview
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;

    setSelectedFile(file);
    setPreviewUrl(url);
    setResult(null);
    setError(null);
  }, []);

  const removeFile = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  }, []);

  const runPrediction = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await predictDefects(selectedFile);
      setResult(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to analyze the image. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  const reset = useCallback(() => {
    removeFile();
    setIsLoading(false);
    setResult(null);
    setError(null);
  }, [removeFile]);

  return {
    selectedFile,
    previewUrl,
    isLoading,
    result,
    error,
    selectFile,
    removeFile,
    runPrediction,
    reset,
  };
}
