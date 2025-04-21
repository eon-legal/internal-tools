import { LIMIT_TEXT_INPUT } from '../../constants/limit-text-input';
import { ResultMethodValidationTextForm } from '../../interfaces/validators-text-number';

export function getValidateInputText(event: Event): ResultMethodValidationTextForm {
  const valor = (event.target as HTMLInputElement).value;
  if (valor && valor.length > LIMIT_TEXT_INPUT && LIMIT_TEXT_INPUT > 0) {
    return { change: true, value: valor.slice(0, LIMIT_TEXT_INPUT) };
  }
  return { change: false };
}
