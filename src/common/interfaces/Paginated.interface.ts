export interface Paginated<Entity> {
  totalCount: number;
  data: Entity[];
}
