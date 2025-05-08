import { 
    integer,
    pgTable,
    varchar,
    text,
    doublePrecision,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const productsTable = pgTable('products', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  image: varchar({length: 255}),
  price: doublePrecision().notNull(),
});

// createInsertSchema should automatically exclude 'id' if it's auto-generated
export const createProductSchema = createInsertSchema(productsTable);

// For updates, ID is usually in URL params, not the body.
// createInsertSchema likely doesn't include 'id' as an input field.
// .partial() makes all other fields optional for the update.
export const updateProductSchema = createInsertSchema(productsTable).partial();
