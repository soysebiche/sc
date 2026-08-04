

import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Verificar método HTTP
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Archivo público. La aplicación también entrega estos datos como un chunk estático.

  try {
    const { type = 'completo' } = req.query;
    if (type !== 'completo') {
      return res.status(400).json({ error: 'Invalid data type. Use: completo' });
    }

    const dataFile = path.join(process.cwd(), 'src', 'data', 'historico_completo_sc.json');

    // Leer el archivo JSON
    if (fs.existsSync(dataFile)) {
      const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800');
      return res.status(200).json(data);
    } else {
      return res.status(404).json({ error: 'Data file not found' });
    }
    
  } catch (error) {
    console.error('Error reading data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
