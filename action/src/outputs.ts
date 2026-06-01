// =============================================================================
// depgraph/action — outputs.ts
// Set GitHub Action outputs.
// =============================================================================

import * as core from '@actions/core';

export function setOutputs(params: {
  overallScore:  number;
  criticalCount: number;
  highCount:     number;
  reportUrl:     string;
}): void {
  core.setOutput('overall-score',  String(params.overallScore));
  core.setOutput('critical-count', String(params.criticalCount));
  core.setOutput('high-count',     String(params.highCount));
  core.setOutput('report-url',     params.reportUrl);
}
