import type {UrlCreation} from "~/types/url-creation.dto";
import {useCallback, useState} from "react";
import {client} from "~/client/backend.client";
import type {UrlOutputType} from "~/types/url-output.type";

const UPDATE_URI = '/urls/:code/:password';

export function useUrlUpdate(code: string) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [error, setError] = useState(null);

  let uri = UPDATE_URI.replace(':code', code);

  const updateURL = useCallback(async (metadata: UrlCreation) => {
    uri = uri.replace(':password', metadata.password!);
    setError(null)
    return client.request<UrlOutputType>({
      method: 'PUT',
      url: uri,
      data: metadata,
    }).then((response) => {
      return response.data
    }).catch((err) => {
      setError(err.response.data.message || err.message);
      setHasError(true);
      throw (err.response.data || err);
    }).finally(() => setIsProcessing(false));
  }, [])

  return {
    isProcessing,
    hasError,
    error,
    updateURL,
  };
}