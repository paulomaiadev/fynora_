import {
  isValidCnpj,
  isValidCpf,
  isValidCpfOrCnpj,
  stripDocument,
} from './document.util';

describe('document.util', () => {
  it('should strip non-digit characters', () => {
    expect(stripDocument('12.345.678/0001-95')).toBe('12345678000195');
  });

  it('should validate a known valid CPF', () => {
    expect(isValidCpf('52998224725')).toBe(true);
  });

  it('should validate a known valid CNPJ', () => {
    expect(isValidCnpj('11222333000181')).toBe(true);
  });

  it('should reject invalid CPF or CNPJ', () => {
    expect(isValidCpfOrCnpj('12345678901')).toBe(false);
    expect(isValidCpfOrCnpj('12345678000100')).toBe(false);
  });
});
