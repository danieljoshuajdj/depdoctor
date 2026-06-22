import semver from 'semver';

/**
 * Determine if installedVersion satisfies the peerRange.
 * Strips workspace/file/link prefixes and handles semver ranges properly.
 */
export function satisfiesPeerRequirement(installedVersion: string | undefined, peerRange: string): boolean {
  if (!installedVersion) return false;
  
  // Remove any workspace/link/file prefix (globally).
  const cleanRange = peerRange.replace(/(?:workspace:|link:|file:)/g, '').trim();
  
  // If range is empty or wildcard, treat it as satisfied.
  if (!cleanRange || cleanRange === '*' || cleanRange === 'latest') return true;
  
  // Clean installed version as well
  const cleanV = installedVersion.replace(/(?:workspace:|link:|file:)/g, '').trim();
  if (!cleanV || cleanV === '*' || cleanV === 'latest') return true;

  // Validate range syntax first.
  if (!semver.validRange(cleanRange)) {
    // If range is something like a git commit, skip.
    return false;
  }

  // Direct check
  if (semver.satisfies(cleanV, cleanRange, { includePrerelease: true })) return true;

  // Coerce installed version (handles things like "19.x").
  const coerced = semver.coerce(cleanV);
  if (!coerced) return false;
  
  // Use semver.satisfies with prerelease included.
  return semver.satisfies(coerced.version, cleanRange, { includePrerelease: true });
}
