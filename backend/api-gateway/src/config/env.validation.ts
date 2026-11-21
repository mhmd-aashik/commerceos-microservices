import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development').default('development'),

  PORT: Joi.number().port().default(3000),

  AUTH_GRPC_HOST: Joi.string().hostname().required(),

  AUTH_GRPC_PORT: Joi.number().port().required(),
});
