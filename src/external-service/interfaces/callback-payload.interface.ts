import { CallbackType } from '../constants/callback-type.enum';
import { EventPayload } from './event-payload.interface';

export type CallbackPayload<TData = any> =
  | {
      type: CallbackType.EVENT;
      data: EventPayload<TData>;
    }
  | {
      type: CallbackType;
      data: TData;
    };
