import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import prisma from '../../src/lib/prisma';

const app = createApp();

describe('Integração: Rotas de Treino (Workout)', () => {
  let userToken = '';
  let workoutId = '';
  let otherUserToken = '';

  beforeAll(async () => {
    // Limpamos o banco antes de testar
    await prisma.exercise.deleteMany();
    await prisma.workout.deleteMany();
    await prisma.user.deleteMany();

    // 1. Criamos um usuário principal
    await request(app).post('/auth/register').send({
      name: 'Atleta Principal',
      email: 'principal@marombapp.com',
      password: 'senha-pesada',
    });
    
    // Pegamos o token dele
    const login1 = await request(app).post('/auth/login').send({
      email: 'principal@marombapp.com',
      password: 'senha-pesada',
    });
    userToken = login1.body.token;

    // 2. Criamos um usuário secundário (para testar invasão)
    await request(app).post('/auth/register').send({
      name: 'Atleta Invasor',
      email: 'invasor@marombapp.com',
      password: 'senha-fraca',
    });

    const login2 = await request(app).post('/auth/login').send({
      email: 'invasor@marombapp.com',
      password: 'senha-fraca',
    });
    otherUserToken = login2.body.token;
  });

  it('Deve criar um novo treino com sucesso', async () => {
    const res = await request(app)
      .post('/workouts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Treino A - Powerlifting',
        description: 'Foco em força pura (Agachamento, Supino, Terra)',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Treino A - Powerlifting');
    
    // Guardamos o ID do treino criado para usar nos testes de baixo
    workoutId = res.body.id; 
  });

  it('Deve listar os treinos do usuário logado', async () => {
    const res = await request(app)
      .get('/workouts')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(workoutId);
  });

  it('Deve atualizar os dados do treino do usuário logado', async () => {
    const res = await request(app)
      .put(`/workouts/${workoutId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Treino A - Powerlifting (Atualizado)',
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Treino A - Powerlifting (Atualizado)');
  });

  it('Deve impedir que outro usuário edite um treino que não é dele', async () => {
    const res = await request(app)
      .put(`/workouts/${workoutId}`)
      .set('Authorization', `Bearer ${otherUserToken}`) // Usando o token do invasor
      .send({
        title: 'Treino Hackeado',
      });

    // 403 Forbidden - O controle de propriedade exigido na C2 funcionou!
    expect(res.status).toBe(403); 
    expect(res.body).toHaveProperty('error');
  });

  it('Deve apagar o treino com sucesso', async () => {
    const res = await request(app)
      .delete(`/workouts/${workoutId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(204); // 204 significa sucesso ao deletar
  });
});