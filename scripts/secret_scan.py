#!/usr/bin/env python3
"""
Bonyo Ecosystem - Production Secret Scan Tool
Checks tracked files, staged changes, and codebase for leaked API keys, tokens, or private credentials.
Exits with code 1 if any leak is detected.
"""

import os
import sys
import re
import subprocess
from pathlib import Path

# Sensitive variable names to check from .env
SENSITIVE_ENV_KEYS = [
    "SMSIR_API_KEY",
    "SMS_IR_API_KEY",
    "GROQ_API_KEY",
    "JWT_SECRET",
    "ZARINPAL_MERCHANT_ID",
]

# Regex patterns for common API keys & secrets
SECRET_PATTERNS = [
    (re.compile(r"gsk_[a-zA-Z0-9]{40,}", re.IGNORECASE), "Groq API Key"),
    (re.compile(r"-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----"), "Private Key"),
    (re.compile(r"NEXT_PUBLIC_(?:SECRET|API_KEY|PASSWORD|PRIVATE)", re.IGNORECASE), "Dangerous NEXT_PUBLIC secret prefix"),
    (re.compile(r"(?:api[_-]?key|secret|token|password)\s*[:=]\s*['\"][a-zA-Z0-9_\-]{24,}['\"]", re.IGNORECASE), "Hardcoded Secret String"),
]

IGNORED_DIRS = {
    ".git",
    "node_modules",
    ".venv",
    "venv",
    ".next",
    "__pycache__",
    ".pytest_cache",
    "test-results",
    "playwright-report",
}

IGNORED_FILES = {
    ".env",
    ".env.backup",
    "bonnivo.db",
    "secret_scan.py",
}

def get_live_secrets_from_env() -> set[str]:
    """Extract actual secret values from local .env to ensure they are NOT in source code."""
    secrets = set()
    env_path = Path(".env")
    if not env_path.exists():
        return secrets

    with open(env_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip("'\"")
            if k in SENSITIVE_ENV_KEYS and len(v) >= 12 and "REPLACE" not in v:
                secrets.add(v)
    return secrets

def scan_files() -> int:
    workspace_root = Path(__file__).resolve().parent.parent
    os.chdir(workspace_root)

    live_secrets = get_live_secrets_from_env()
    violations = []

    print("[*] Starting Bonyo Zero-Leak Secret Scan...")

    for root, dirs, files in os.walk(workspace_root):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]

        for file in files:
            if file in IGNORED_FILES:
                continue

            file_path = Path(root) / file
            rel_path = file_path.relative_to(workspace_root)

            # Skip binary files
            if file_path.suffix.lower() in {".png", ".jpg", ".jpeg", ".ico", ".svg", ".lock", ".db", ".sqlite"}:
                continue

            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()

                # Check exact live secret values from .env
                for secret in live_secrets:
                    if secret in content:
                        violations.append((str(rel_path), f"Direct match of live secret value from .env"))

                # Check secret regex patterns
                for pattern, name in SECRET_PATTERNS:
                    matches = pattern.findall(content)
                    if matches:
                        # Allow placeholder strings
                        valid_matches = [m for m in matches if "REPLACE" not in str(m) and "example" not in str(m).lower()]
                        if valid_matches:
                            violations.append((str(rel_path), f"Pattern matched: {name}"))

            except Exception as e:
                # Unreadable file, skip
                pass

    if violations:
        print("\n[!] FATAL: Secret Scan detected violations in the repository:")
        for file, reason in violations:
            print(f"  - {file}: {reason}")
        print("\nPlease remove all hardcoded secrets or environment values before proceeding.\n")
        return 1

    print("[+] PASS: Secret Scan completed successfully. No credentials or secrets found in codebase.")
    return 0

if __name__ == "__main__":
    sys.exit(scan_files())
