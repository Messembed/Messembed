import { isString } from 'lodash';

export function transformJson(value: unknown): unknown {
  if (isString(value)) {
    return JSON.parse(value);
  }

  return value;
}
