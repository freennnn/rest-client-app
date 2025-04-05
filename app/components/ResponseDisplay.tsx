import React from "react";

interface ResponseDisplayProps {
  responseData: {
    status: number;
    statusText: string;
    body: string;
    time?: number;
  } | null;
  error: string | null;
}

export default function ResponseDisplay({
  responseData,
  error,
}: ResponseDisplayProps) {
  return (
    <div className="border rounded-md p-4">
      <h2 className="text-xl font-bold mb-2">Response</h2>

      {error && (
        <div className="bg-red-100 border-red-400 border p-3 rounded mb-4 text-red-700">
          {error}
        </div>
      )}

      {responseData ? (
        <div className="border rounded overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-800 p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  responseData.status < 300
                    ? "bg-green-500"
                    : responseData.status < 400
                    ? "bg-blue-500"
                    : responseData.status < 500
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></span>
              <span className="font-medium">
                Status: {responseData.status} {responseData.statusText}
              </span>
            </div>
            {responseData.time && (
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Time: {responseData.time}ms
              </span>
            )}
          </div>

          <div className="p-0">
            <pre className="font-mono text-sm overflow-auto p-4 max-h-96">
              {responseData.body}
            </pre>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 p-4">
          Response will appear here after sending a request
        </div>
      )}
    </div>
  );
}
