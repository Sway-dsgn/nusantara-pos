import { Router } from 'express';
import { nanoid } from 'nanoid';
import pool from '../db.js';
import { verifyToken, requireOwner } from '../middleware/auth.js';

const router = Router();

// GET /api/transactions
router.get('/', verifyToken, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'owner') {
      result = await pool.query('SELECT * FROM transactions ORDER BY tanggal DESC');
    } else {
      result = await pool.query('SELECT * FROM transactions WHERE kasir_id = $1 ORDER BY tanggal DESC', [req.user.id]);
    }

    // Attach items
    for (const tx of result.rows) {
      const items = await pool.query('SELECT * FROM detail_transactions WHERE transaksi_id = $1', [tx.id]);
      tx.items = items.rows;
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions
router.post('/', verifyToken, async (req, res) => {
  const { items, total, diskon, metode_bayar } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Transaksi harus memiliki minimal 1 item' });
  }
  if (!metode_bayar) {
    return res.status(400).json({ error: 'Metode pembayaran harus dipilih' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const id = `TX-${nanoid(6)}`;
    const tanggal = new Date().toISOString();
    const userResult = await client.query('SELECT id, nama FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    const { pelanggan_nama, pelanggan_wa, pelanggan_domisili, pelanggan_rekening } = req.body;

    await client.query(`
      INSERT INTO transactions (id, tanggal, kasir_id, kasir_nama, total, diskon, metode_bayar, status, pelanggan_nama, pelanggan_wa, pelanggan_domisili, pelanggan_rekening)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'lunas', $8, $9, $10, $11)
    `, [id, tanggal, user.id, user.nama, total || 0, diskon || 0, metode_bayar, pelanggan_nama || '', pelanggan_wa || '', pelanggan_domisili || '', pelanggan_rekening || '']);

    for (const item of items) {
      await client.query(`
        INSERT INTO detail_transactions (transaksi_id, produk_id, produk_nama, qty, harga_saat_jual, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [id, item.produk_id, item.produk_nama, item.qty, item.harga_saat_jual, item.subtotal]);
    }

    await client.query('COMMIT');

    const txResult = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
    const txItems = await pool.query('SELECT * FROM detail_transactions WHERE transaksi_id = $1', [id]);

    res.status(201).json({ ...txResult.rows[0], items: txItems.rows });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PATCH /api/transactions/:id/status
router.patch('/:id/status', verifyToken, requireOwner, async (req, res) => {
  const { id } = req.params;
  const { status, retur_alasan } = req.body;

  if (!status || !['lunas', 'retur'].includes(status)) {
    return res.status(400).json({ error: 'Status harus lunas atau retur' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT * FROM transactions WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    await client.query('UPDATE transactions SET status = $1, retur_alasan = $2 WHERE id = $3', [status, retur_alasan || null, id]);

    // If retur, restore stock
    if (status === 'retur') {
      const items = await client.query('SELECT * FROM detail_transactions WHERE transaksi_id = $1', [id]);
      for (const item of items.rows) {
        await client.query('UPDATE products SET stok = stok + $1 WHERE id = $2', [item.qty, item.produk_id]);

        const moveId = `STK-${nanoid(6)}`;
        await client.query(`
          INSERT INTO stock_movements (id, produk_id, produk_nama, jenis, jumlah, tanggal, oleh_user_id, oleh_user_nama, keterangan)
          VALUES ($1, $2, $3, 'masuk', $4, $5, $6, $7, $8)
        `, [moveId, item.produk_id, item.produk_nama, item.qty, new Date().toISOString(), req.user.id, req.user.nama, `Retur pengembalian transaksi ${id}. Alasan: ${retur_alasan}`]);
      }
    }

    await client.query('COMMIT');

    const txResult = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
    const txItems = await pool.query('SELECT * FROM detail_transactions WHERE transaksi_id = $1', [id]);

    res.json({ ...txResult.rows[0], items: txItems.rows });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;
