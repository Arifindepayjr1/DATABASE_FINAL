import { exec } from 'child_process';
  import fs from 'fs';
  import path from 'path';
  import { promisify } from 'util';
  import { fileURLToPath } from 'url';

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const execPromise = promisify(exec);

  const restoreDatabase = async (backupFile) => {
    const backupPath = path.join(__dirname, '..', '..', 'backups', backupFile);
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '@@Arifin012',
      database: process.env.DB_NAME || 'testgaming',
    };

    const mysqlBinPath = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin';
    const mysql = path.join(mysqlBinPath, 'mysql');
    const dropCommand = `"${mysql}" -h ${dbConfig.host} -u ${dbConfig.user} ${dbConfig.password ? `--password="${dbConfig.password}"` : ''} -e "DROP DATABASE IF EXISTS ${dbConfig.database}; CREATE DATABASE ${dbConfig.database};"`;
    const restoreCommand = `tar -xzf "${backupPath}" - | "${mysql}" -h ${dbConfig.host} -u ${dbConfig.user} ${dbConfig.password ? `--password="${dbConfig.password}"` : ''} ${dbConfig.database}`;

    try {
      await execPromise(dropCommand);
      await execPromise(restoreCommand);
      console.log(`Database restored from ${backupPath}`);
      return { status: 'SUCCESS', message: `Database restored from ${backupPath}` };
    } catch (error) {
      console.error('Restore failed:', error);
      throw new Error(`Failed to restore database: ${error.message}`);
    }
  };

  export { restoreDatabase };