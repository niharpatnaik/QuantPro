import { z } from 'zod';
import { insertChallengeSchema, insertSubmissionSchema, challenges, submissions } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  challenges: {
    list: {
      method: 'GET' as const,
      path: '/api/challenges',
      responses: {
        200: z.array(z.custom<typeof challenges.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/challenges/:id',
      responses: {
        200: z.custom<typeof challenges.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/challenges',
      input: insertChallengeSchema,
      responses: {
        201: z.custom<typeof challenges.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  submissions: {
    list: {
      method: 'GET' as const,
      path: '/api/submissions',
      responses: {
        200: z.array(z.custom<typeof submissions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/submissions',
      input: insertSubmissionSchema,
      responses: {
        201: z.custom<typeof submissions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/submissions/:id',
      responses: {
        200: z.custom<typeof submissions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
