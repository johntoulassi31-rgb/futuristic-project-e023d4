import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
export const projects = pgTable('projects', {
 id: uuid().defaultRandom().primaryKey(),
 owner: text().notNull(),
 title: text().notNull(),
 domain: text().notNull(),
 description: text().notNull(),
 role: text().notNull(),
 steps: jsonb().$type<{title:string;description:string;done:boolean}[]>().notNull(),
 createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const learningSpaces = pgTable('learning_spaces', {
 owner: text().primaryKey(),
 career: text(),
 completed: jsonb().$type<string[]>().notNull().default([]),
 portfolio: jsonb().$type<{career:string;completed:string[];date:string}[]>().notNull().default([]),
 day: text().notNull().default(''),
});
export const courses = pgTable('courses', {
 id: uuid().defaultRandom().primaryKey(),
 owner: text().notNull(),
 title: text().notNull(),
 content: text().notNull(),
 explanation: text().notNull().default(''),
 quiz: jsonb().$type<{question:string;options:string[];answer:number;explanation:string}[]>(),
 attempts: jsonb().$type<{score:number;total:number;date:string}[]>().notNull().default([]),
 messages: jsonb().$type<{question:string;answer:string}[]>().notNull().default([]),
 createdAt: timestamp('created_at').defaultNow().notNull(),
});
