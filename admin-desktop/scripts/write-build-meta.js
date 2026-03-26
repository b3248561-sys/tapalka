const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function getCommitHash() {
  try {
    const repoRoot = path.resolve(__dirname, "..", "..");
    const hash = execSync("git rev-parse --short HEAD", { cwd: repoRoot })
      .toString()
      .trim();
    if (hash) return hash;
  } catch {
    // fall through
  }
  try {
    const repoRoot = path.resolve(__dirname, "..", "..");
    const gitPath = path.join(repoRoot, ".git");
    let gitDir = gitPath;
    if (!fs.statSync(gitPath).isDirectory()) {
      const link = fs.readFileSync(gitPath, "utf8").trim();
      const match = /^gitdir:\s*(.+)$/i.exec(link);
      if (!match) return "unknown";
      gitDir = path.resolve(repoRoot, match[1]);
    }
    const head = fs.readFileSync(path.join(gitDir, "HEAD"), "utf8").trim();
    if (head.startsWith("ref: ")) {
      const ref = head.slice(5).trim();
      const refFile = path.join(gitDir, ...ref.split("/"));
      const fullHash = fs.readFileSync(refFile, "utf8").trim();
      return fullHash ? fullHash.slice(0, 7) : "unknown";
    }
    return head ? head.slice(0, 7) : "unknown";
  } catch {
    return "unknown";
  }
}

function isDirtyTree() {
  try {
    const repoRoot = path.resolve(__dirname, "..", "..");
    const output = execSync("git status --porcelain", { cwd: repoRoot })
      .toString()
      .trim();
    return Boolean(output);
  } catch {
    return false;
  }
}

function writeBuildMeta() {
  const pkg = require(path.resolve(__dirname, "..", "package.json"));
  const hash = getCommitHash();
  const dirty = isDirtyTree();
  const buildId = `desktop-v${pkg.version}-${hash}${dirty ? "-dirty" : ""}`;
  const outFile = path.resolve(__dirname, "..", "app", "build-meta.js");
  const content = `window.__ADMIN_BUILD__ = ${JSON.stringify(buildId)};\n`;
  fs.writeFileSync(outFile, content, "utf8");
  process.stdout.write(`build meta written: ${buildId}\n`);
}

writeBuildMeta();
