import { Schema } from 'mongoose';

export interface TenantModelDefinition {
  name: string;
  schema: Schema;
  collection?: string;
}
