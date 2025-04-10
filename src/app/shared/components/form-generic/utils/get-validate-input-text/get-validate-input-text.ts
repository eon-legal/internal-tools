import { LIMIT_TEXT_INPUT } from '../../constants/limit-text-input';

export function getValidateInputText(event: Event): {
  change: boolean;
  value?: string | null;
} {
  const valor = (event.target as HTMLInputElement).value;
  if (valor && valor.length > LIMIT_TEXT_INPUT && LIMIT_TEXT_INPUT > 0) {
    return { change: true, value: valor.slice(0, LIMIT_TEXT_INPUT) };
  }
  return { change: false };
}
