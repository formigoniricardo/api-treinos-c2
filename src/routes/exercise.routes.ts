import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth';

const router = Router();

const exerciseSchema = z.object({
  name: z.string().min(2, "Nome inválido"),
  sets: z.number().int().positive(),
  reps: z.string(),
  workoutId: z.string()
});

// 1. CREATE
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = exerciseSchema.parse(req.body);
    
    // Verifica se o treino existe e pertence ao usuário
    const workout = await prisma.workout.findUnique({ where: { id: data.workoutId } });
    if (!workout || workout.userId !== req.user!.id) {
      res.status(403).json({ error: 'Treino não encontrado ou acesso negado' }); return;
    }

    const exercise = await prisma.exercise.create({ data });
    res.status(201).json(exercise);
  } catch (error) {
    res.status(400).json({ error: 'Dados inválidos' });
  }
});

// 2. READ ALL (Pega todos os exercícios de todos os treinos do usuário)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const exercises = await prisma.exercise.findMany({
    where: { workout: { userId: req.user!.id } }
  });
  res.json(exercises);
});

// 3. DELETE
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const exerciseId = String(req.params.id);
  
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { workout: true } // Trazemos o treino junto para checar o dono
  });

  if (!exercise) { res.status(404).json({ error: 'Exercício não encontrado' }); return; }
  if (exercise.workout.userId !== req.user!.id) { res.status(403).json({ error: 'Acesso negado' }); return; }

  await prisma.exercise.delete({ where: { id: exerciseId } });
  res.status(204).send();
});

export default router;