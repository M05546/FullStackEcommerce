import { integer, pgTable, varchar, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";



export const usersTable = pgTable('users', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    email: varchar({length: 255}).notNull().unique(),
    password: varchar({length: 255}).notNull(),
    role: varchar({length: 255}).notNull().default('user'),
    
    name: varchar({length: 255}),
    address: text(),
    
});

export const createUserSchema = createInsertSchema(usersTable).omit({
    id: true ,
    role: true,
});


// export const loginSchema = z.object({
//     email: z.string().email({ message: "Invalid email address" }).transform((val) => val.trim().toLowerCase()),
//     password: z.string().min(8, { message: "Password must contain at least 8 characters" }),
//   });

// export const loginSchema = createInsertSchema(usersTable).pick({
//     email: true,
//     password: true,
// });

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;


export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }).transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(passwordRegex, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
    }),
});
export const registerSchema = z
  .object({
    email: z.string().email({ message: "Invalid email" }).transform((val) => val.trim().toLowerCase()),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(passwordRegex, { message: "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character" }),
  });
