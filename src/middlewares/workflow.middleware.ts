import { Request, Response, NextFunction } from 'express';
import workflowService from '../services/workflowService';

const VALID_STEP_TYPES = ['sendEmail', 'updateGrant'] as const;
type StepType = (typeof VALID_STEP_TYPES)[number];

export interface ValidatedStep {
  name: string;
  type: StepType;
  dependsOn: string[];
  fail?: boolean;
}

export function validateWorkflow(req: Request, res: Response, next: NextFunction) {
  const { name, steps } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: "Workflow 'name' is required and must be a string" });
  }

  if (!Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({ error: "'steps' must be a non-empty array" });
  }

  const validSteps: ValidatedStep[] = [];

  for (const [i, step] of steps.entries()) {
    if (!step.name || typeof step.name !== 'string') {
      console.warn(`Step at index ${i} is invalid (missing name), skipping`);
      continue;
    }

    if (!step.type || !VALID_STEP_TYPES.includes(step.type)) {
      console.warn(`Step '${step.name}' has invalid type '${step.type}', skipping`);
      continue;
    }

    const dependsOn: string[] = Array.isArray(step.dependsOn) ? step.dependsOn : [];
    const fail = typeof step.fail === 'boolean' ? step.fail : false;

    validSteps.push({
      name: step.name,
      type: step.type,
      dependsOn,
      fail,
    });
  }

  if (validSteps.length === 0) {
    return res.status(400).json({ error: 'No valid steps provided' });
  }

  req.body.steps = validSteps;

  next();
}

export function verifyWorkflowId(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Workflow ID is required' });
  }

  const workflow = workflowService.getWorkflow(id);

  if (!workflow) {
    return res.status(404).json({ error: `Workflow with ID '${id}' not found` });
  }

  (req as any).workflow = workflow;

  next();
}
