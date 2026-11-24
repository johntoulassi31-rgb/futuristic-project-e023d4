import { pgTable, uuid, text, jsonb, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
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
 profile: jsonb().$type<{country:string;institution:string;field:string;level:string;role:'student'|'teacher';customInstitution?:string}>().notNull().default({country:'TG',institution:'Université de Lomé',field:'gestion-marketing',level:'licence-1',role:'student'}),
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

export const users = pgTable('users', {
 id: uuid().defaultRandom().primaryKey(),
 email: text().notNull(),
 passwordHash: text('password_hash').notNull(),
 displayName: text('display_name').notNull(),
 role: text().notNull(),
 createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => [uniqueIndex('users_email_unique').on(table.email)]);
export const sessions = pgTable('sessions', {
 id: uuid().defaultRandom().primaryKey(),
 userId: uuid('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),
 tokenHash: text('token_hash').notNull(),
 expiresAt: timestamp('expires_at').notNull(),
 createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => [uniqueIndex('sessions_token_hash_unique').on(table.tokenHash)]);
