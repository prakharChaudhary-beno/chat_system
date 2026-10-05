import { app } from './app.js';

import { pool } from './config/db.js';

const port = Number(process.env.PORT ?? 3000);


if (!Number.isInteger(port) || port < 1 || port > 65535) {
     throw new Error('PORT not found check again');
}

const server = app.listen(port, () => {
  process.stdout.write(` backend is listening on port ${port}\n`);
});

function shutdown(): void {
  server.close(() => {
    
    void pool.end().finally(() => process.exit(0));
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);