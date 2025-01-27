import express from 'express';
import sequelize from './database/dbconnection.js';
import userRoutes from './src/modules/user/user.routes.js';
import requestRoutes from './src/modules/Request/request.routes.js';
import path from 'path';

const app = express();
const port = 3000;

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);

// Test database connection and start server
sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
