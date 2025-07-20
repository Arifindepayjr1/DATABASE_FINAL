import express from 'express';
  import { backupDatabase, cleanOldBackups } from './backupDatabase.js';
  import { restoreDatabase } from './restoreDatabase.js';
  import fs from 'fs';
  import path from 'path';
  import { fileURLToPath } from 'url';

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const backupRouter = express.Router();

  backupRouter.post('/create', async (req, res) => {
    try {
      const result = await backupDatabase();
      res.status(200).json(result);
    } catch (error) {
      console.error('Error creating backup:', error);
      res.status(500).json({ status: 'FAILURE', error: error.message });
    }
  });

  backupRouter.post('/clean', async (req, res) => {
    try {
      const result = await cleanOldBackups();
      res.status(200).json(result);
    } catch (error) {
      console.error('Error cleaning backups:', error);
      res.status(500).json({ status: 'FAILURE', error: error.message });
    }
  });

  backupRouter.post('/restore', async (req, res) => {
    const { backupFile } = req.body;
    if (!backupFile) {
      return res.status(400).json({ status: 'FAILURE', error: 'Backup file name required' });
    }
    try {
      const result = await restoreDatabase(backupFile);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error restoring database:', error);
      res.status(500).json({ status: 'FAILURE', error: error.message });
    }
  });

  backupRouter.get('/list', async (req, res) => {
    try {
      const backupDir = path.join(__dirname, '..', '..', 'backups'); // Adjusted to reach DataBaseAdministration\backups
      const files = fs.readdirSync(backupDir).filter(file => file.endsWith('.sql.tar.gz'));
      res.status(200).json({ status: 'SUCCESS', data: files });
    } catch (error) {
      console.error('Error listing backups:', error);
      res.status(500).json({ status: 'FAILURE', error: error.message });
    }
  });

  export default backupRouter;