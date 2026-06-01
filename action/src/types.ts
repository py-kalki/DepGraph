// =============================================================================
// depgraph/action — Types
// Shared type definitions for the GitHub Action package.
// =============================================================================

export type FailOn = 'none' | 'critical' | 'high' | 'medium';
export type GateResult = 'pass' | 'warn' | 'fail';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'healthy';

export type ScoredDep = {
  name:            string;
  version:         string;
  score:           number;
  riskLevel:       RiskLevel;
  abandonmentRisk: boolean;
  cveCount:        number;
};

export type DepEntry = {
  name:    string;
  version: string;
};

export type DepDelta = {
  added:   ScoredDep[];
  removed: DepEntry[];
  updated: Array<{
    name:        string;
    fromVersion: string;
    toVersion:   string;
    scoreDelta:  number | null;
  }>;
};

export type CompareResult = {
  base_score:     number;
  head_score:     number;
  score_delta:    number;
  critical_count: number;
  high_count:     number;
  medium_count:   number;
  added:          ScoredDep[];
  removed:        DepEntry[];
  updated:        DepDelta['updated'];
};

export type DecisionResult = {
  result:    GateResult;
  reason:    string;
  exit_code: 0 | 1;
};

export type ScanResult = {
  overall_score:  number;
  critical_count: number;
  high_count:     number;
  dep_scores:     ScoredDep[];
  report_url:     string;
};

export type ActionInputs = {
  apiKey:      string;
  failOn:      FailOn;
  postComment: boolean;
  apiUrl:      string;
};
