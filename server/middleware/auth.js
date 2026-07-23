import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nusantara-pos-secret-key-2026';

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token tidak valid atau expired' });
  }
}

export function requireOwner(req, res, next) {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Hanya Owner yang memiliki akses' });
  }
  next();
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, nama: user.nama, role: user.role, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}
