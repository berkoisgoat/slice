import { v4 as uuid } from 'uuid';
import db from '../db/inMemoryDb';
import { WorkflowDefinition } from '../types/workflowTypes';

class WorkflowService {
  createWorkflow(data: WorkflowDefinition) {
    const id = uuid();
    db.workflows[id] = { id, ...data };
    return id;
  }

  getAllWorkflows() {
    return Object.values(db.workflows);
  }

  getWorkflow(id: string) {
    return db.workflows[id] || null;
  }
}

export default new WorkflowService();
