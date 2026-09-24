/**
 * src/lib/versions.ts
 *
 * Utility functions for managing and accessing versioned documentation.
 * Handles reading versions.json metadata, comparing versions, and providing
 * version-aware navigation helpers.
 */

export interface VersionMetadata {
  version: string;
  released: string; // ISO date string
  label: string; // e.g., "v1.0.0"
  path: string; // e.g., "/docs/v1.0.0"
}

// Cache for versions data
let versionsCache: VersionMetadata[] | null = null;

/**
 * Loads versions metadata from docs/versions.json
 * This is called at build time via getVersions() or at runtime in client components.
 */
export async function loadVersionsMetadata(): Promise<VersionMetadata[]> {
  if (versionsCache !== null) {
    return versionsCache;
  }

  try {
    // At build time, read from file system
    if (typeof window === 'undefined') {
      const fs = await import('fs');
      const path = await import('path');

      const versionsPath = path.join(
        process.cwd(),
        'docs',
        'versions.json'
      );

      if (!fs.existsSync(versionsPath)) {
        return [];
      }

      const content = fs.readFileSync(versionsPath, 'utf8');
      versionsCache = JSON.parse(content);
      return versionsCache;
    }

    // At runtime in browser, fetch from API
    const response = await fetch('/api/versions');
    if (!response.ok) {
      console.warn('Failed to fetch versions metadata');
      return [];
    }

    versionsCache = await response.json();
    return versionsCache;
  } catch (error) {
    console.error('Error loading versions metadata:', error);
    return [];
  }
}

/**
 * Gets all available versions
 */
export async function getVersions(): Promise<VersionMetadata[]> {
  return loadVersionsMetadata();
}

/**
 * Gets a specific version by version string (e.g., "1.0.0")
 */
export async function getVersion(
  version: string
): Promise<VersionMetadata | undefined> {
  const versions = await getVersions();
  return versions.find((v) => v.version === version);
}

/**
 * Gets the latest released version
 */
export async function getLatestVersion(): Promise<VersionMetadata | undefined> {
  const versions = await getVersions();
  return versions[0]; // Versions are sorted with latest first
}

/**
 * Checks if a version exists
 */
export async function versionExists(version: string): Promise<boolean> {
  const v = await getVersion(version);
  return v !== undefined;
}

/**
 * Gets the "current" or "next" version label
 * This represents the unversioned /docs path (always latest development version)
 */
export function getCurrentVersionLabel(): string {
  return 'Next';
}

/**
 * Gets all available version options for the switcher
 * Includes "Next" (current unversioned) and all released versions
 */
export async function getVersionOptions(): Promise<
  { label: string; path: string; isNext: boolean; version?: string }[]
> {
  const versions = await getVersions();

  const options = [
    {
      label: getCurrentVersionLabel(),
      path: '/docs',
      isNext: true,
    },
    ...versions.map((v) => ({
      label: v.label,
      path: v.path,
      isNext: false,
      version: v.version,
    })),
  ];

  return options;
}

/**
 * Normalizes a version string (removes leading 'v' if present)
 */
export function normalizeVersion(version: string): string {
  return version.startsWith('v') ? version.slice(1) : version;
}

/**
 * Extracts version from a docs URL path
 * Returns undefined if path is for current/next docs
 *
 * Examples:
 *   "/docs/v1.0.0/getting-started/intro" -> "1.0.0"
 *   "/docs/getting-started/intro" -> undefined
 */
export function getVersionFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/docs\/(v[\d.]+(?:-[\w.]+)?)\//);
  return match ? normalizeVersion(match[1]) : undefined;
}

/**
 * Gets the current page slug from a versioned or unversioned path
 *
 * Examples:
 *   "/docs/v1.0.0/getting-started/intro" -> "getting-started/intro"
 *   "/docs/getting-started/intro" -> "getting-started/intro"
 */
export function getSlugFromPath(pathname: string): string | undefined {
  // For versioned paths: /docs/v1.0.0/...slug
  const versionedMatch = pathname.match(/^\/docs\/v[\d.]+(?:-[\w.]+)?\/(.+)$/);
  if (versionedMatch) {
    return versionedMatch[1];
  }

  // For unversioned paths: /docs/...slug
  const unversionedMatch = pathname.match(/^\/docs\/(.+)$/);
  if (unversionedMatch) {
    return unversionedMatch[1];
  }

  return undefined;
}

/**
 * Constructs a URL for the same page in a different version
 *
 * Examples:
 *   buildVersionedUrl("1.0.0", "getting-started/intro") -> "/docs/v1.0.0/getting-started/intro"
 *   buildVersionedUrl(undefined, "getting-started/intro") -> "/docs/getting-started/intro"
 */
export function buildVersionedUrl(
  version: string | undefined,
  slug: string
): string {
  if (!version) {
    return `/docs/${slug}`;
  }
  return `/docs/v${normalizeVersion(version)}/${slug}`;
}

/**
 * Compares two semantic versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const v1Parts = v1.split('.').map((p) => parseInt(p, 10));
  const v2Parts = v2.split('.').map((p) => parseInt(p, 10));

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part < v2Part) return -1;
    if (v1Part > v2Part) return 1;
  }

  return 0;
}
