import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Verificar método HTTP
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar autenticación básica (puedes mejorar esto)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - Token required' });
  }

  const token = authHeader.substring(7);
  
  // Aquí puedes implementar tu lógica de validación de token
  // Por ahora usamos un token simple (deberías usar JWT o similar en producción)
  if (token !== process.env.API_SECRET_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    // Obtener el tipo de datos solicitado
    const { type } = req.query;
    
    let dataFile;
    let data;
    
    switch (type) {
      case 'conmebol':
        dataFile = path.join(process.cwd(), 'data', 'historico_conmebol_sc.json');
        break;
      case 'inca':
        dataFile = path.join(process.cwd(), 'data', 'historico_inca_sc.json');
        break;
      case 'completo':
        dataFile = path.join(process.cwd(), 'data', 'historico_completo_sc.json');
        break;
      default:
        return res.status(400).json({ error: 'Invalid data type. Use: conmebol, inca, or completo' });
    }

    // Leer el archivo JSON
    if (fs.existsSync(dataFile)) {
      data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      return res.status(200).json(data);
    } else {
      return res.status(404).json({ error: 'Data file not found' });
    }
    
  } catch (error) {
    console.error('Error reading data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
