import workflowService from './workflowService';

interface ExecutedStep {
  name: string;
  type: string;
  status: 'success' | 'failed' | 'skipped';
}

interface WorkflowRun {
  workflowId: string;
  executedSteps: ExecutedStep[];
  updatedAt: number;
}

class WorkflowRunner {
  private runs: WorkflowRun[] = [];

  async runWorkflow(id: string) {
    const workflow = workflowService.getWorkflow(id);
    if (!workflow) return { error: 'Workflow not found' };

    const executedSteps: ExecutedStep[] = [];
    const stepPromises = new Map<string, Promise<ExecutedStep>>();

    for (const step of workflow.steps) {
      stepPromises.set(step.name, this.executeStep(step, executedSteps, stepPromises));
    }

    const results = await Promise.all(stepPromises.values());

    const runRecord: WorkflowRun = {
      workflowId: id,
      executedSteps: results,
      updatedAt: Date.now(),
    };

    this.runs.push(runRecord);
    return runRecord;
  }

  private async executeStep(
    step: any,
    executedSteps: ExecutedStep[],
    stepPromises: Map<string, Promise<ExecutedStep>>
  ): Promise<ExecutedStep> {
    const deps = step.dependsOn || [];

    // Wait for dependencies to finish
    const depResults = await Promise.all(deps.map((d: string) => stepPromises.get(d)));

    if (depResults.some((r) => r.status !== 'success')) {
      console.log(`[step:${step.name}] skipped due to failed dependencies`);
      return { name: step.name, type: step.type, status: 'skipped' };
    }

    // Simulate failure flag
    if (step.fail) {
      console.log(`[step:${step.name}] simulated failure`);
      return { name: step.name, type: step.type, status: 'failed' };
    }

    return this.performAction(step);
  }

  private async performAction(step: any): Promise<ExecutedStep> {
    console.log(`Starting step: ${step.name} (type: ${step.type})`);

    switch (step.type) {
      case 'sendEmail':
        console.log(`[step:${step.name}] email sent!`);
        break;
      case 'updateGrant':
        console.log(`[step:${step.name}] grant updated`);
        break;
      default:
        console.log(`[step:${step.name}] unknown type → treating as success`);
    }

    return { name: step.name, type: step.type, status: 'success' };
  }

  getRunsByWorkflowId(id: string) {
    return this.runs.filter((run) => run.workflowId === id);
  }
}

export default new WorkflowRunner();
