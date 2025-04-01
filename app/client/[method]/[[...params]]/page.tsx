"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { decodeBase64 } from "@/utils/base64";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const RestClientContainer = dynamic(
  () => import("@/components/rest-client/RestClientContainer"),
  {
    loading: () => (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    ),
    ssr: false,
  }
);

export default function ClientPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safely extract and parse parameters
  const [method, endpoint, body, headers] = (() => {
    try {
      // Extract method from route params, default to GET
      const methodParam = ((params?.method as string) || "GET").toUpperCase();

      // Extract endpoint and body from route params (if available)
      let decodedEndpoint = "";
      let decodedBody = "";

      if (params?.params) {
        const paramsArray = Array.isArray(params.params)
          ? params.params
          : [params.params];

        try {
          if (paramsArray[0]) {
            decodedEndpoint = decodeBase64(paramsArray[0]);
          }

          if (paramsArray[1]) {
            decodedBody = decodeBase64(paramsArray[1]);
          }
        } catch (error) {
          console.error("Error decoding params:", error);
          setError(
            "Invalid URL parameters. Please check your URL or try a new request."
          );
        }
      }

      // Extract headers from query params
      const headersObj: Record<string, string> = {};
      if (searchParams) {
        for (const [key, value] of searchParams.entries()) {
          headersObj[key] = value;
        }
      }

      return [methodParam, decodedEndpoint, decodedBody, headersObj];
    } catch (e) {
      console.error("Error parsing URL parameters:", e);
      setError("An error occurred while parsing the URL parameters.");
      return ["GET", "", "", {}];
    }
  })();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4 max-w-lg text-center">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <Button asChild className="mt-4">
            <Link href="/client/GET">
              <RefreshCw className="h-4 w-4 mr-2" />
              Start a new request
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <RestClientContainer
      method={
        method as
          | "GET"
          | "POST"
          | "PUT"
          | "DELETE"
          | "PATCH"
          | "OPTIONS"
          | "HEAD"
      }
      endpoint={endpoint}
      bodyContent={body}
      initialHeaders={headers}
    />
  );
}
