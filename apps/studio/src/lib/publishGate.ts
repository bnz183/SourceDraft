export type PublishGateInputs = {
  ready: boolean;
  publishing: boolean;
  githubReady: boolean;
  demoMode: boolean;
};

/**
 * A real publish mutates the connected repository, so it is only allowed for a
 * configured, connected, non-demo Studio. Demo mode never publishes for real —
 * it only simulates. The Studio shell already renders the publish bar for
 * authenticated sessions; the server is the authoritative boundary and routes
 * demo sessions to simulation while rejecting unauthenticated requests.
 */
export function isRealPublish(
  inputs: Pick<PublishGateInputs, "githubReady" | "demoMode">,
): boolean {
  return inputs.githubReady && !inputs.demoMode;
}

/**
 * Whether the publish/simulate button may be submitted: the article must be
 * valid, not already in flight, and either a real connected blog (non-demo) or
 * demo mode (simulation only).
 */
export function canSubmitPublish(inputs: PublishGateInputs): boolean {
  if (!inputs.ready || inputs.publishing) {
    return false;
  }

  return isRealPublish(inputs) || inputs.demoMode;
}
