import { useState, useEffect } from 'react';

// Este hook pega um valor (o que o usuário está digitando)
// e só o atualiza de fato após um 'delay'
export function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Inicia um timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Se o usuário digitar de novo, limpa o timer anterior
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Só re-executa se o valor ou o delay mudarem

  return debouncedValue;
}