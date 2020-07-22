import { EventName } from '../constants/event-name.enum';

export interface EventPayload<TData = any> {
  name: EventName;
  data: TData;
}
