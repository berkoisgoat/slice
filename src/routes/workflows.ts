import { Router } from 'express';
import { validateWorkflow, verifyWorkflowId } from '../middlewares/workflow.middleware';
import workflowService from '../services/workflowService';
import workflowRunner from '../services/workflowRunner';

const router = Router();

/**
 * @swagger
 * /workflows:
 *   post:
 *     summary: Create a new workflow
 *     tags:
 *       - Workflows
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sample Workflow
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Send Email
 *                     type:
 *                       type: string
 *                       enum: ['sendEmail', 'updateGrant']
 *                       example: sendEmail
 *                     dependsOn:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     fail:
 *                       type: boolean
 *                       example: false
 *                       description: Simulate a failure for this step
 *     responses:
 *       201:
 *         description: Workflow successfully created
 */
router.post('/', validateWorkflow, (req, res) => {
  const workflow = workflowService.createWorkflow(req.body);
  res.status(201).json(workflow);
});

/**
 * @swagger
 * /workflows:
 *   get:
 *     summary: Get all workflows
 *     tags:
 *       - Workflows
 *     responses:
 *       200:
 *         description: List of workflows
 */
router.get('/', (_, res) => {
  res.json(workflowService.getAllWorkflows());
});

/**
 * @swagger
 * /workflows/{id}/runs:
 *   get:
 *     summary: List all triggered runs for a workflow
 *     tags:
 *       - Workflows
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Workflow ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of workflow runs with step statuses
 */
router.get('/:id/runs', verifyWorkflowId, (req, res) => {
  const workflow = (req as any).workflow;
  const runs = workflowRunner.getRunsByWorkflowId(workflow.id);
  res.json(runs);
});

/**
 * @swagger
 * /workflows/{id}/run:
 *   post:
 *     summary: Run a workflow by ID
 *     tags:
 *       - Workflows
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Workflow ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workflow executed
 *       404:
 *         description: Workflow not found
 */
router.post('/:id/run', verifyWorkflowId, async (req, res) => {
  const id = req.params.id;
  const result = await workflowRunner.runWorkflow(id);
  res.json(result);
});

export default router;
