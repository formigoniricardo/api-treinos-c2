import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import prisma from '../../src/lib/prisma';

const app = createApp();

describe('Integração: Rotas de Exercício', () => {
  let userToken = '';
  let workoutId = '';

  beforeAll(async () => {
    // Limpar o banco
    await prisma.exercise.deleteMany();
    await prisma.workout.deleteMany();
    await prisma.user.deleteMany();

    // 1. Criar usuário e logar
    await request(app).post('/auth/register').send({
      name: 'Atleta Focado',
      email: 'focado@marombapp.com',
      password: 'senha-segura',
    });
    
    const login = await request(app).post('/auth/login').send({
      email: 'focado@marombapp.com',
      password: 'senha-segura',
    });
    userToken = login.body.token;

    // 2. Criar um treino para receber os exercícios
    const workoutRes = await request(app)
      .post('/workouts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Treino de Pernas',
      });
    workoutId = workoutRes.body.id;
  });

  it('Deve criar um exercício novo no treino', async () => {
    const res = await request(app)
      .post('/exercises')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Agachamento Livre',
        sets: 4,
        reps: '10-12',
        workoutId: workoutId
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Agachamento Livre');
  });

  it('Deve listar os exercícios do usuário', async () => {
    const res = await request(app)
      .get('/exercises')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });
});