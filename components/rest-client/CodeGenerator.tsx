'use client';

import { useState } from 'react';
import { replaceVariables } from '@/utils/variableUtils';
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type CodeLanguage = 'curl' | 'javascript-fetch' | 'javascript-xhr' | 'nodejs' | 'python' | 'java' | 'csharp' | 'go';

interface CodeGeneratorProps {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export default function CodeGenerator({ method, url, headers, body }: CodeGeneratorProps) {
  const [language, setLanguage] = useState<CodeLanguage>('curl');
  
  // Language display names for better readability
  const languageNames: Record<CodeLanguage, string> = {
    'curl': 'cURL',
    'javascript-fetch': 'JavaScript (Fetch)',
    'javascript-xhr': 'JavaScript (XHR)',
    'nodejs': 'Node.js',
    'python': 'Python',
    'java': 'Java',
    'csharp': 'C#',
    'go': 'Go'
  };

  // Get language color based on language - moved outside generateGo to be available at component level
  const getLanguageColor = (lang: CodeLanguage): string => {
    const colors: Record<CodeLanguage, string> = {
      'curl': 'bg-gray-500',
      'javascript-fetch': 'bg-yellow-500',
      'javascript-xhr': 'bg-yellow-600',
      'nodejs': 'bg-green-600',
      'python': 'bg-blue-500',
      'java': 'bg-red-600',
      'csharp': 'bg-purple-600',
      'go': 'bg-cyan-500'
    };
    
    return colors[lang];
  };

  const processedUrl = replaceVariables(url);
  const processedHeaders = Object.entries(headers).reduce((acc, [key, value]) => {
    acc[key] = replaceVariables(value);
    return acc;
  }, {} as Record<string, string>);
  
  const processedBody = body ? replaceVariables(body) : undefined;
  
  const generateCode = (): string => {
    if (!url.trim()) {
      return 'Please enter a URL to generate code.';
    }
    
    switch (language) {
      case 'curl':
        return generateCurl();
      case 'javascript-fetch':
        return generateJavaScriptFetch();
      case 'javascript-xhr':
        return generateJavaScriptXHR();
      case 'nodejs':
        return generateNodeJS();
      case 'python':
        return generatePython();
      case 'java':
        return generateJava();
      case 'csharp':
        return generateCSharp();
      case 'go':
        return generateGo();
      default:
        return 'Select a language to generate code.';
    }
  };
  
  const generateCurl = (): string => {
    let command = `curl -X ${method} "${processedUrl}"`;
    
    // Add headers
    Object.entries(processedHeaders).forEach(([key, value]) => {
      command += ` \\\n  -H "${key}: ${value}"`;
    });
    
    // Add body for POST, PUT, PATCH
    if (processedBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      command += ` \\\n  -d '${processedBody}'`;
    }
    
    return command;
  };
  
  const generateJavaScriptFetch = (): string => {
    let code = 'const options = {\n';
    code += `  method: "${method}"`;
    
    if (Object.keys(processedHeaders).length > 0) {
      code += ',\n  headers: {\n';
      code += Object.entries(processedHeaders)
        .map(([key, value]) => `    "${key}": "${value}"`)
        .join(',\n');
      code += '\n  }';
    }
    
    if (processedBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      code += ',\n  body: ' + (
        processedHeaders['Content-Type']?.includes('json') 
          ? JSON.stringify(processedBody, null, 2)
          : `"${processedBody}"`
      );
    }
    
    code += '\n};\n\n';
    code += `fetch("${processedUrl}", options)\n`;
    code += '  .then(response => response.json())\n';
    code += '  .then(data => console.log(data))\n';
    code += '  .catch(error => console.error(error));';
    
    return code;
  };
  
  const generateJavaScriptXHR = (): string => {
    let code = 'const xhr = new XMLHttpRequest();\n';
    code += `xhr.open("${method}", "${processedUrl}");\n\n`;
    
    // Add headers
    Object.entries(processedHeaders).forEach(([key, value]) => {
      code += `xhr.setRequestHeader("${key}", "${value}");\n`;
    });
    
    code += '\nxhr.onload = function() {\n';
    code += '  if (xhr.status >= 200 && xhr.status < 300) {\n';
    code += '    const data = JSON.parse(xhr.responseText);\n';
    code += '    console.log(data);\n';
    code += '  } else {\n';
    code += '    console.error("Request failed with status:", xhr.status);\n';
    code += '  }\n';
    code += '};\n\n';
    
    code += 'xhr.onerror = function() {\n';
    code += '  console.error("Request failed");\n';
    code += '};\n\n';
    
    if (processedBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      code += `xhr.send(${
        processedHeaders['Content-Type']?.includes('json') 
          ? 'JSON.stringify(' + processedBody + ')'
          : `"${processedBody}"`
      });`;
    } else {
      code += 'xhr.send();';
    }
    
    return code;
  };
  
  const generateNodeJS = (): string => {
    let code = 'const https = require("https");\n\n';
    
    // Parse URL to get hostname, path, etc.
    code += 'const options = {\n';
    code += `  method: "${method}",\n`;
    code += '  hostname: "' + new URL(processedUrl).hostname + '",\n';
    code += '  path: "' + new URL(processedUrl).pathname + new URL(processedUrl).search + '",\n';
    
    if (Object.keys(processedHeaders).length > 0) {
      code += '  headers: {\n';
      code += Object.entries(processedHeaders)
        .map(([key, value]) => `    "${key}": "${value}"`)
        .join(',\n');
      code += '\n  }\n';
    } else {
      code += '};\n';
    }
    
    code += '\nconst req = https.request(options, (res) => {\n';
    code += '  let data = "";\n\n';
    code += '  res.on("data", (chunk) => {\n';
    code += '    data += chunk;\n';
    code += '  });\n\n';
    code += '  res.on("end", () => {\n';
    code += '    console.log(JSON.parse(data));\n';
    code += '  });\n';
    code += '});\n\n';
    
    code += 'req.on("error", (error) => {\n';
    code += '  console.error(error);\n';
    code += '});\n\n';
    
    if (processedBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      code += `req.write(${
        processedHeaders['Content-Type']?.includes('json') 
          ? 'JSON.stringify(' + processedBody + ')'
          : `"${processedBody}"`
      });\n`;
    }
    
    code += 'req.end();';
    
    return code;
  };
  
  const generatePython = (): string => {
    let code = 'import requests\n\n';
    
    code += `url = "${processedUrl}"\n`;
    
    if (Object.keys(processedHeaders).length > 0) {
      code += 'headers = {\n';
      code += Object.entries(processedHeaders)
        .map(([key, value]) => `    "${key}": "${value}"`)
        .join(',\n');
      code += '\n}\n\n';
    } else {
      code += 'headers = {}\n\n';
    }
    
    if (processedBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      code += `payload = ${
        processedHeaders['Content-Type']?.includes('json') 
          ? processedBody
          : `"${processedBody}"`
      }\n\n`;
      
      code += `response = requests.${method.toLowerCase()}(url, headers=headers, ${
        processedHeaders['Content-Type']?.includes('json') ? 'json=payload' : 'data=payload'
      })\n`;
    } else {
      code += `response = requests.${method.toLowerCase()}(url, headers=headers)\n`;
    }
    
    code += '\nprint(response.status_code)\n';
    code += 'print(response.json())';
    
    return code;
  };
  
  const generateJava = (): string => {
    let code = 'import java.io.BufferedReader;\n';
    code += 'import java.io.InputStreamReader;\n';
    code += 'import java.io.OutputStream;\n';
    code += 'import java.net.HttpURLConnection;\n';
    code += 'import java.net.URL;\n\n';
    
    code += 'public class RestClient {\n';
    code += '    public static void main(String[] args) {\n';
    code += '        try {\n';
    code += `            URL url = new URL("${processedUrl}");\n`;
    code += '            HttpURLConnection conn = (HttpURLConnection) url.openConnection();\n';
    code += `            conn.setRequestMethod("${method}");\n\n`;
    
    // Add headers
    Object.entries(processedHeaders).forEach(([key, value]) => {
      code += `            conn.setRequestProperty("${key}", "${value}");\n`;
    });
    
    // Add body for POST, PUT, PATCH
    if (processedBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      code += '\n            conn.setDoOutput(true);\n';
      code += '            try (OutputStream os = conn.getOutputStream()) {\n';
      code += `                byte[] input = "${processedBody}".getBytes("utf-8");\n`;
      code += '                os.write(input, 0, input.length);\n';
      code += '            }\n';
    }
    
    code += '\n            int responseCode = conn.getResponseCode();\n';
    code += '            System.out.println("Response Code: " + responseCode);\n\n';
    
    code += '            try (BufferedReader br = new BufferedReader(\n';
    code += '                new InputStreamReader(conn.getInputStream(), "utf-8"))) {\n';
    code += '                StringBuilder response = new StringBuilder();\n';
    code += '                String responseLine;\n';
    code += '                while ((responseLine = br.readLine()) != null) {\n';
    code += '                    response.append(responseLine.trim());\n';
    code += '                }\n';
    code += '                System.out.println(response.toString());\n';
    code += '            }\n';
    code += '        } catch (Exception e) {\n';
    code += '            e.printStackTrace();\n';
    code += '        }\n';
    code += '    }\n';
    code += '}';
    
    return code;
  };
  
  const generateCSharp = (): string => {
    let code = 'using System;\n';
    code += 'using System.IO;\n';
    code += 'using System.Net;\n';
    code += 'using System.Text;\n\n';
    
    code += 'class Program\n{\n';
    code += '    static void Main()\n    {\n';
    code += '        try\n        {\n';
    code += `            var request = (HttpWebRequest)WebRequest.Create("${processedUrl}");\n`;
    code += `            request.Method = "${method}";\n`;
    
    // Add headers
    Object.entries(processedHeaders).forEach(([key, value]) => {
      code += `            request.Headers["${key}"] = "${value}";\n`;
    });
    
    // Add body for POST, PUT, PATCH
    if (processedBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      code += '\n            byte[] data = Encoding.UTF8.GetBytes(';
      code += processedHeaders['Content-Type']?.includes('json') 
        ? `@"${processedBody}"`
        : `"${processedBody}"`;
      code += ');\n';
      code += '            request.ContentType = "application/json";\n';
      code += '            request.ContentLength = data.Length;\n\n';
      code += '            using (var stream = request.GetRequestStream())\n';
      code += '            {\n';
      code += '                stream.Write(data, 0, data.Length);\n';
      code += '            }\n';
    }
    
    code += '\n            var response = (HttpWebResponse)request.GetResponse();\n';
    code += '            Console.WriteLine($"Status Code: {(int)response.StatusCode}");\n\n';
    
    code += '            using (var streamReader = new StreamReader(response.GetResponseStream()))\n';
    code += '            {\n';
    code += '                var result = streamReader.ReadToEnd();\n';
    code += '                Console.WriteLine(result);\n';
    code += '            }\n';
    code += '        }\n';
    code += '        catch (Exception e)\n';
    code += '        {\n';
    code += '            Console.WriteLine(e.Message);\n';
    code += '        }\n';
    code += '    }\n';
    code += '}';
    
    return code;
  };
  
  const generateGo = (): string => {
    let code = 'package main\n\n';
    code += 'import (\n';
    code += '    "fmt"\n';
    code += '    "io/ioutil"\n';
    code += '    "net/http"\n';
    code += '    "strings"\n';
    code += ')\n\n';
    
    if (processedBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      code += `    payload := strings.NewReader(\`${processedBody}\`)\n\n`;
      code += `    req, err := http.NewRequest("${method}", "${processedUrl}", payload)\n`;
    } else {
      code += `    req, err := http.NewRequest("${method}", "${processedUrl}", nil)\n`;
    }
    
    code += '    if err != nil {\n';
    code += '        fmt.Println("Error creating request:", err)\n';
    code += '        return\n';
    code += '    }\n\n';
    
    // Add headers
    if (Object.keys(processedHeaders).length > 0) {
      Object.entries(processedHeaders).forEach(([key, value]) => {
        code += `    req.Header.Add("${key}", "${value}")\n`;
      });
      code += '\n';
    }
    
    code += '    client := &http.Client{}\n';
    code += '    resp, err := client.Do(req)\n';
    code += '    if err != nil {\n';
    code += '        fmt.Println("Error sending request:", err)\n';
    code += '        return\n';
    code += '    }\n';
    code += '    defer resp.Body.Close()\n\n';
    
    code += '    fmt.Println("Response Status:", resp.Status)\n\n';
    
    code += '    body, err := ioutil.ReadAll(resp.Body)\n';
    code += '    if err != nil {\n';
    code += '        fmt.Println("Error reading response:", err)\n';
    code += '        return\n';
    code += '    }\n\n';
    
    code += '    fmt.Println(string(body))\n';
    code += '}';

    return code;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Generated Code</h3>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline"
              className="bg-black text-white hover:bg-gray-800 border-gray-700 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getLanguageColor(language)}`}></span>
                {languageNames[language]}
              </span>
              <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black border-gray-800 text-white">
            {(Object.keys(languageNames) as CodeLanguage[]).map((lang) => (
              <DropdownMenuItem 
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex items-center gap-2 cursor-pointer hover:bg-gray-800 ${
                  lang === language ? 'bg-gray-800' : ''
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${getLanguageColor(lang)}`}></span>
                {languageNames[lang]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="relative">
        <pre className="w-full h-64 p-4 overflow-auto bg-gray-200 dark:bg-gray-800 rounded-md font-mono text-sm">
          {generateCode()}
        </pre>
        <Button
          onClick={() => {
            navigator.clipboard.writeText(generateCode());
          }}
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 bg-black text-white hover:bg-gray-800 border-gray-700"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
      </div>
    </div>
  );
}
