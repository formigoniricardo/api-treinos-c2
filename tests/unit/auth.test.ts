import { describe, it, expect } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Unitário: Helpers de Autenticação', () => {
  const SECRET = 'chave-secreta-de-testes';
  
  // 1. Teste de Hash
  it('Deve gerar um hash diferente da senha em texto plano', async () => {
    const password = 'minhasenha123';
    const hash = await bcrypt.hash(password, 10);
    
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(20);
  });

  // 2. Teste de Verificação (Correto)
  it('Deve validar corretamente uma senha com seu hash', async () => {
    const password = 'minhasenha123';
    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare(password, hash);
    
    expect(isValid).toBe(true);
  });

  // 3. Teste de Verificação (Incorreto)
  it('Deve rejeitar uma senha incorreta', async () => {
    const password = 'minhasenha123';
    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare('senhaerrada', hash);
    
    expect(isValid).toBe(false);
  });

  // 4. Teste de Assinatura de Token
  it('Deve assinar um payload e gerar um token JWT', () => {
    const payload = { id: 'atleta-123', role: 'USER' };
    const token = jwt.sign(payload, SECRET);
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  // 5. Teste de Decodificação de Token
  it('Deve decodificar um token JWT corretamente', () => {
    const payload = { id: 'atleta-123', role: 'USER' };
    const token = jwt.sign(payload, SECRET);
    const decoded = jwt.verify(token, SECRET) as { id: string; role: string };
    
    expect(decoded.id).toBe(payload.id);
    expect(decoded.role).toBe(payload.role);
  });
});