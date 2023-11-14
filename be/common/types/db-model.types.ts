import { Model as M1 } from 'sequelize';
import { Model as M2 } from 'sequelize-typescript';

export type ModelType = M1 & M2;

export type SchemaType<T> = Omit<T, keyof ModelType>;

export type SchemaFieldsType<T> = Omit<T, keyof DefaultDbFields>;

export interface DefaultDbFields {
  id: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
