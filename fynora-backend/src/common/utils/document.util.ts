export function stripDocument(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  return String(value).replace(/\D/g, '');
}

function isRepeatedDigits(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

function calculateCpfCheckDigit(digits: string, factor: number): number {
  let total = 0;

  for (let index = 0; index < factor - 1; index += 1) {
    total += Number(digits[index]) * (factor - index);
  }

  const remainder = (total * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

export function isValidCpf(value: string): boolean {
  const cpf = stripDocument(value);

  if (cpf.length !== 11 || isRepeatedDigits(cpf)) {
    return false;
  }

  const firstDigit = calculateCpfCheckDigit(cpf, 10);
  const secondDigit = calculateCpfCheckDigit(cpf, 11);

  return (
    firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10])
  );
}

function calculateCnpjCheckDigit(digits: string, weights: number[]): number {
  let total = 0;

  for (let index = 0; index < weights.length; index += 1) {
    total += Number(digits[index]) * weights[index];
  }

  const remainder = total % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(value: string): boolean {
  const cnpj = stripDocument(value);

  if (cnpj.length !== 14 || isRepeatedDigits(cnpj)) {
    return false;
  }

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const firstDigit = calculateCnpjCheckDigit(cnpj, firstWeights);
  const secondDigit = calculateCnpjCheckDigit(cnpj, secondWeights);

  return (
    firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13])
  );
}

export function isValidCpfOrCnpj(value: string): boolean {
  const digits = stripDocument(value);

  if (digits.length === 11) {
    return isValidCpf(digits);
  }

  if (digits.length === 14) {
    return isValidCnpj(digits);
  }

  return false;
}
