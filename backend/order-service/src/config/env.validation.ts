import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development').default('development'),

  GRPC_URL: Joi.string().required(),

  DATABASE_URL: Joi.string().required(),
});
