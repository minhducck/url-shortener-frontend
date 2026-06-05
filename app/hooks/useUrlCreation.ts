import type { UrlCreation } from "~/types/url-creation.dto";
import { useEffect, useState } from "react";
import { client } from "~/client/backend.client";
import type { UrlOutputType } from "~/types/url-output.type";

const URL_CREATE_URI = '/urls';

export function useShortenURLAPI() {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [error, setError] = useState(null);
  const handleResponse = (response: UrlCreation) => {
  }

  useEffect(() => {
    setHasError(Boolean(error));
  }, [error]);

  const createShortenURL = async (metadata: UrlCreation) => {
    return client.request<UrlOutputType>({
      method: 'POST',
      url: URL_CREATE_URI,
      data: JSON.stringify(metadata),
    }).then((response) => {
      return response.data
    }).catch((err) => {
      setError(err);
      throw err;
    }).finally(() => setIsProcessing(false));
  }

  return {
    isProcessing,
    hasError,
    error,
    createShortenURL,
  };
}