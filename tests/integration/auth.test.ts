import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import prisma from '../../src/lib/prisma';

const app = createApp();

describe('Integração: Rotas de Autenticação', () => {
  // Antes de rodar os testes, limpamos a tabela de usuários para não dar conflito de email duplicado
  beforeAll(async () => {
    await prisma.exercise.deleteMany();
    await prisma.workout.deleteMany();
    await prisma.user.deleteMany();
  });

  it('Deve registrar um novo atleta com sucesso', async () => {
    const res = await request(app).post('/auth/register').send({
      name: 'Atleta Teste',
      email: 'atleta@teste.com',
      password: 'senha-segura',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Atleta Teste');
    expect(res.body).not.toHaveProperty('password'); // A senha NUNCA deve vazar
  });

  it('Deve impedir o cadastro de um email já existente', async () => {
    const res = await request(app).post('/auth/register').send({
      name: 'Outro Atleta',
      email: 'atleta@teste.com', // Mesmo email de cima
      password: 'outrasenha',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('Deve fazer login e retornar um JWT', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'atleta@teste.com',
      password: 'senha-segura',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('Deve bloquear o acesso a rotas protegidas sem o token', async () => {
    // Tentando acessar a rota de listar treinos sem passar o token
    const res = await request(app).get('/workouts');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Token não fornecido');
  });
});