import _ from 'lodash';

export function TransformInt(value: unknown): number {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const number = parseInt(value as string, 10);

  if (_.isInteger(number)) {
    return number;
  }

  /**
   * Let other validators deal with this
   */
  return number;
}
