// // Piston API is a service for code execution

// const PISTON_API = "https://emkc.org/api/v2/piston";

// const LANGUAGE_VERSIONS = {
//   javascript: { language: "javascript", version: "18.15.0" },
//   python: { language: "python", version: "3.10.0" },
//   java: { language: "java", version: "15.0.2" },
// };

// /**
//  * @param {string} language - programming language
//  * @param {string} code - source code to executed
//  * @returns {Promise<{success:boolean, output?:string, error?: string}>}
//  */
// export async function executeCode(language, code) {
//   try {
//     const languageConfig = LANGUAGE_VERSIONS[language];

//     if (!languageConfig) {
//       return {
//         success: false,
//         error: `Unsupported language: ${language}`,
//       };
//     }

//     const response = await fetch(`${PISTON_API}/execute`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         language: languageConfig.language,
//         version: languageConfig.version,
//         files: [
//           {
//             name: `main.${getFileExtension(language)}`,
//             content: code,
//           },
//         ],
//       }),
//     });

//     if (!response.ok) {
//       return {
//         success: false,
//         error: `HTTP error! status: ${response.status}`,
//       };
//     }

//     const data = await response.json();

//     const output = data.run.output || "";
//     const stderr = data.run.stderr || "";

//     if (stderr) {
//       return {
//         success: false,
//         output: output,
//         error: stderr,
//       };
//     }

//     return {
//       success: true,
//       output: output || "No output",
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: `Failed to execute code: ${error.message}`,
//     };
//   }
// }

// function getFileExtension(language) {
//   const extensions = {
//     javascript: "js",
//     python: "py",
//     java: "java",
//   };

//   return extensions[language] || "txt";
// }
/**
 * Piston API Code Execution Client
 * Base URL for the official EMKC Piston public instance
 */
const PISTON_API = "https://emkc.org/api/v2/piston";

/**
 * Supported languages and their corresponding versions verified from the API runtimes
 */
const LANGUAGE_VERSIONS = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
};

/**
 * Executes source code using the Piston API.
 * * @param {string} language - The programming language (e.g., 'javascript', 'python', 'java')
 * @param {string} code - The source code string to execute
 * @returns {Promise<{success: boolean, output?: string, error?: string}>}
 */
export async function executeCode(language, code) {
  try {
    // Normalize language input to lowercase for robust lookup matching
    const normalizedLang = language.toLowerCase();
    const languageConfig = LANGUAGE_VERSIONS[normalizedLang];

    if (!languageConfig) {
      return {
        success: false,
        error: `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_VERSIONS).join(", ")}`,
      };
    }

    // Explicitly target the execution endpoint
    const response = await fetch(`${PISTON_API}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: languageConfig.language,
        version: languageConfig.version,
        files: [
          {
            name: `main.${getFileExtension(normalizedLang)}`,
            content: code,
          },
        ],
      }),
    });

    // Handle non-2xx HTTP responses (like 404, 500, etc.)
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status} - ${response.statusText}`,
      };
    }

    const data = await response.json();

    // Guard clause if the structural response shape is unexpected
    if (!data || !data.run) {
      return {
        success: false,
        error: "Malformed response structure received from Piston API.",
      };
    }

    const output = data.run.output || "";
    const stderr = data.run.stderr || "";

    // If stderr contains data, execution failed on compilation/runtime
    if (stderr) {
      return {
        success: false,
        output: output,
        error: stderr,
      };
    }

    return {
      success: true,
      output: output || "No output",
    };
  } catch (error) {
    // Catch-all for network downages or internal fetch runtime issues
    return {
      success: false,
      error: `Failed to execute code: ${error.message}`,
    };
  }
}

/**
 * Helper to resolve the standard file extension naming conventions
 * @param {string} language 
 * @returns {string} file extension
 */
function getFileExtension(language) {
  const extensions = {
    javascript: "js",
    python: "py",
    java: "java",
  };

  return extensions[language] || "txt";
}