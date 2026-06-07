import {useCallback, useState} from "react";
import {client} from "~/client/backend.client";

const DELETE_URI = '/urls/:code/:password';

export function useUrlDelete(code: string, password: string) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [error, setError] = useState(null);

  let uri = DELETE_URI.replace(':code', code);
  uri = uri.replace(':password', password!);

  const deleteURL = useCallback(async () => {
    setError(null)
    return client.request<boolean>({
      method: 'DELETE',
      url: uri,
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
    deleteURL,
  };
}