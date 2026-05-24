import { tokenStorage } from "@/store/tokenStorage";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await tokenStorage.getAccessToken();

      setIsAuthorized(!!token);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isAuthorized,
  };
};
