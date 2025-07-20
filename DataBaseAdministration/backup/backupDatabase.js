import { exec } from 'child_process';
  import fs from 'fs';
  import { promisify } from 'util';
  import path from 'path';
  import { fileURLToPath } from 'url';

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const execPromise = promisify(exec);

  const backupDatabase = async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    const tempFile = path.join(backupDir, `temp-${timestamp}.sql`);
    const backupFile = path.join(backupDir, `admindb-backup-${timestamp}.sql.tar.gz`);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '@@Arifin012',
      database: process.env.DB_NAME || 'testgaming',
    };

    const mysqlBinPath = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin';
    const mysqldump = path.join(mysqlBinPath, 'mysqldump');
    const dumpCommand = `"${mysqldump}" -h ${dbConfig.host} -u ${dbConfig.user} ${dbConfig.password ? `--password="${dbConfig.password}"` : ''} ${dbConfig.database} > "${tempFile}"`;

    try {
      await execPromise(dumpCommand);
      if (fs.existsSync(tempFile) && fs.statSync(tempFile).size > 0) {
        const tarCommand = `tar -czf "${backupFile}" "${tempFile}"`;
        await execPromise(tarCommand);
        fs.unlinkSync(tempFile); // Clean up temp file
        console.log(`Backup created: ${backupFile}`);
        return { status: 'SUCCESS', message: `Backup created at ${backupFile}` };
      } else {
        throw new Error('No data dumped by mysqldump');
      }
    } catch (error) {
      console.error('Backup failed:', error);
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  };

  const cleanOldBackups = async () => {
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    const retentionDays = 7;
    const now = Date.now();

    try {
      if (!fs.existsSync(backupDir)) {
        return { status: 'SUCCESS', message: 'No backups to clean' };
      }
      const files = fs.readdirSync(backupDir);
      for (const file of files) {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);
        if (fileAge > retentionDays) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old backup: ${filePath}`);
        }
      }
      return { status: 'SUCCESS', message: 'Old backups cleaned' };
    } catch (error) {
      console.error('Failed to clean backups:', error);
      throw new Error(`Failed to clean backups: ${error.message}`);
    }
  };

  export { backupDatabase, cleanOldBackups };