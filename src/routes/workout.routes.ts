import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth';

const router = Router();

// Validação do Zod para Treinos
const workoutSchema = z.object({
  title: z.string().min(3, "O título deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
});

// 1. CREATE - Criar Treino
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = workoutSchema.parse(req.body);
    const workout = await prisma.workout.create({
      data: { ...data, userId: req.user!.id },
    });
    res.status(201).json(workout);
  } catch (error) {
    res.status(400).json({ error: 'Dados inválidos' });
  }
});

// 2. READ ALL - Listar todos os treinos do usuário logado
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const workouts = await prisma.workout.findMany({
    where: { userId: req.user!.id },
    include: { exercises: true }, 
  });
  res.json(workouts);
});

// 3. READ ONE - Buscar um treino específico
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const workoutId = String(req.params.id);
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: { exercises: true }
  });

  if (!workout || workout.userId !== req.user!.id) {
    res.status(404).json({ error: 'Treino não encontrado' }); return;
  }
  res.json(workout);
});

// 4. UPDATE - Atualizar Treino (Controle de Propriedade)
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = workoutSchema.parse(req.body);
    const workoutId = String(req.params.id);
    const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
    
    if (!workout) { res.status(404).json({ error: 'Treino não encontrado' }); return; }
    if (workout.userId !== req.user!.id) { res.status(403).json({ error: 'Acesso negado. Você não é o dono.' }); return; }

    const updatedWorkout = await prisma.workout.update({
      where: { id: workoutId },
      data
    });
    res.json(updatedWorkout);
  } catch (error) {
    res.status(400).json({ error: 'Dados inválidos' });
  }
});

// 5. DELETE - Apagar Treino (Controle de Propriedade)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const workoutId = String(req.params.id);
  const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
  
  if (!workout) { res.status(404).json({ error: 'Treino não encontrado' }); return; }
  if (workout.userId !== req.user!.id) { res.status(403).json({ error: 'Acesso negado.' }); return; }

  await prisma.workout.delete({ where: { id: workoutId } });
  res.status(204).send(); 
});

export default router;