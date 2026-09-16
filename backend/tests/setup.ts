import { config } from 'dotenv';
import path from 'path';

// Load test environment
config({ path: path.resolve(__dirname, '../.env') });

// Ensure test environment
process.env['NODE_ENV'] = 'test';
