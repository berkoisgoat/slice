import express from 'express';
import workflowRoutes from './routes/workflows';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

const app = express();

app.use(express.json());

app.use('/workflows', workflowRoutes);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
