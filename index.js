import express from 'express';
import sequelize from './database/dbconnection.js';
import userRoutes from './src/modules/user/user.routes.js';
import requestRoutes from './src/modules/Request/request.routes.js';
import mainRoutes from './src/modules/Main/main.routes.js';
import adsRoutes from './src/modules/Ads/ads.routes.js';
import labelRoutes from './src/modules/Labels/label.routes.js';
import editRequestsRoutes from './src/modules/EditRequest/editrequest.routes.js';
import codeRoutes from './src/modules/Code/code.routes.js';
import articleRoutes from './src/modules/Articls/articls.routes.js';
import "./database/Models/associateModels.js";
import path from 'path';
import cors from 'cors';
const app = express();
const port = 3005;
app.use(cors());
app.use(express.json({ limit: "100mb" })); // Adjust as needed
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/main', mainRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/label', labelRoutes);
app.use('/api/edits', editRequestsRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/article', articleRoutes);
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

  app.use((err, req, res, next) => {
    console.error('Error:', err); // Logs the error for debugging
  
    // Set status code (default to 500 if not set)
    const statusCode = err.statusCode || 500;
  
    res.status(statusCode).json({
      status: err.status || 'error',
      message: err.message || 'Something went wrong!',
    });
  });