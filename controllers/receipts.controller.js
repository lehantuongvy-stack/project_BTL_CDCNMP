const db = require('../db');

exports.createReceipt = async (req, res) => {
  // body: { supplier?, items: [{ingredient_id, qty, price}] }
  const { supplier, items } = req.body;
  if (!Array.isArray(items) || !items.length)
    return res.status(400).json({ message: 'items rỗng' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rc] = await conn.query('INSERT INTO receipts (supplier) VALUES (?)', [supplier || null]);
    const rid = rc.insertId;

    for (const it of items) {
      await conn.query(
        'INSERT INTO receipt_items (receipt_id, ingredient_id, qty, price) VALUES (?,?,?,?)',
        [rid, it.ingredient_id, it.qty, it.price || 0]
      );
      // tăng tồn kho
      await conn.query(
        'UPDATE inventory SET quantity = quantity + ? WHERE ingredient_id=?',
        [it.qty, it.ingredient_id]
      );
    }

    await conn.commit();
    res.status(201).json({ id: rid, message: 'Đã tạo phiếu nhập & cập nhật kho' });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ message: 'Lỗi tạo phiếu nhập' });
  } finally {
    conn.release();
  }
};

exports.listReceipts = async (req, res) => {
  const { from, to } = req.query;
  const params = [];
  let sql = 'SELECT * FROM receipts WHERE 1=1';
  if (from) { sql += ' AND DATE(created_at) >= ?'; params.push(from); }
  if (to)   { sql += ' AND DATE(created_at) <= ?'; params.push(to); }
  sql += ' ORDER BY id DESC';
  const [rows] = await db.query(sql, params);
  res.json(rows);
};

exports.getReceipt = async (req, res) => {
  const [[receipt]] = await db.query('SELECT * FROM receipts WHERE id=?', [req.params.id]);
  if (!receipt) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
  const [items] = await db.query(
    `SELECT ri.id, ri.qty, ri.price, i.name, i.unit, ri.ingredient_id
     FROM receipt_items ri JOIN ingredients i ON i.id=ri.ingredient_id
     WHERE ri.receipt_id=?`, [req.params.id]
  );
  res.json({ ...receipt, items });
};
