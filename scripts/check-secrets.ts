import * as fs from "fs";
import * as path from "path";

const SECRET_PATTERNS = [
  { name: "Google Gemini API Key", regex: /AIzaSy[A-Za-z0-9_-]{33}/g },
  { name: "OpenAI API Key", regex: /sk-[A-Za-z0-9]{20,48}/g },
  { name: "Generic Secret Assignment", regex: /(api[_-]?key|secret[_-]?key)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/gi },
];

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function scanForSecrets(targetDir: string) {
  console.log(`🔍 Scanning directory for hardcoded secrets: ${targetDir}`);
  const files = getAllFiles(targetDir);
  let secretsFound = 0;

  for (const file of files) {
    // Only check code and text files
    if (!/\.(ts|tsx|js|jsx|json|md)$/.test(file)) continue;

    const content = fs.readFileSync(file, "utf8");

    for (const pattern of SECRET_PATTERNS) {
      const matches = content.match(pattern.regex);
      if (matches) {
        // Filter out false positives in placeholder / schema examples
        const validMatches = matches.filter(
          (m) =>
            !m.includes("placeholder") &&
            !m.includes("sk-your") &&
            !m.includes("AIzaSy-placeholder")
        );

        if (validMatches.length > 0) {
          console.error(`🚨 ALERT: Potential ${pattern.name} found in: ${file}`);
          secretsFound += validMatches.length;
        }
      }
    }
  }

  if (secretsFound === 0) {
    console.log(`✅ SUCCESS: Zero secrets or hardcoded API keys detected across ${files.length} files in ${targetDir}.`);
    process.exit(0);
  } else {
    console.error(`❌ FAILURE: Found ${secretsFound} sensitive key pattern(s)! Commit aborted.`);
    process.exit(1);
  }
}

const target = path.resolve(__dirname, "../src");
scanForSecrets(target);
