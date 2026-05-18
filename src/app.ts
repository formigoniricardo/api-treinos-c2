import express from 'express';
import authRoutes from './routes/auth.routes';
import workoutRoutes from './routes/workout.routes';
import exerciseRoutes from './routes/exercise.routes'; // <-- Importe aqui

export const createApp = () => {
  const app = express();
  app.use(express.json());

  app.use('/auth', authRoutes);
  app.use('/workouts', workoutRoutes);
  app.use('/exercises', exerciseRoutes); // <-- Adicione aqui

  return app;
};