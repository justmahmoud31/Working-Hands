import express from 'express';
import sequelize from './database/dbconnection.js';
import userRoutes from './src/modules/user/user.routes.js';
import requestRoutes from './src/modules/Request/request.routes.js';
import mainRoutes from './src/modules/Main/main.routes.js';
import adsRoutes from './src/modules/Ads/ads.routes.js';
import labelRoutes from './src/modules/Labels/label.routes.js';
import path from 'path';

const app = express();
const port = 3000;

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/main', mainRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/label', labelRoutes);
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
