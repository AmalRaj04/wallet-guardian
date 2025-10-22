import { neon } from '@neondatabase/serverless';
import { peekServerEnv } from '@/lib/config';

const NullishQueryFunction = () => {
  throw new Error(
    'No database connection string was provided to `neon()`. Perhaps DATABASE_URL has not been set in your environment.'
  );
};
NullishQueryFunction.transaction = () => {
  throw new Error(
    'No database connection string was provided to `neon()`. Perhaps DATABASE_URL has not been set in your environment.'
  );
};

const DATABASE_URL = peekServerEnv('DATABASE_URL');
const sql = DATABASE_URL ? neon(DATABASE_URL) : NullishQueryFunction;

export default sql;