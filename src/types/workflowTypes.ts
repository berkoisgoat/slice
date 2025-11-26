export interface WorkflowStep {
  name: string;
  type: 'sendEmail' | 'updateGrant';
  dependsOn?: string[];
  fail?: boolean;
}

export interface WorkflowDefinition {
  name: string;
  steps: WorkflowStep[];
}
