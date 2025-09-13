//Kho nguyên liệu (ingredients + inventory + receipts
const db = require('../db');

exports.listIngredients = async (req, res) => {
  const [rows] = await db.query(
    `SELECT i.id, i.name, i.unit,
            IFNULL(inv.quantity,0) as quantity,
            IFNULL(inv.min_threshold,0) as min_threshold
     FROM ingredients i
     LEFT JOIN inventory inv ON inv.ingredient_id=i.id
     ORDER BY i.id DESC`
  );
  res.json(rows);
};

exports.createIngredient = async (req, res) => {
  const { name, unit, min_threshold } = req.body;
  if (!name || !unit) return res.status(400).json({ message: 'Thiếu name/unit' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rs] = await conn.query('INSERT INTO ingredients (name, unit) VALUES (?,?)',[name, unit]);
    await conn.query(
      'INSERT INTO inventory (ingredient_id, quantity, min_threshold) VALUES (?,?,?)',
      [rs.insertId, 0, min_threshold || 0]
    );
    await conn.commit();
    res.status(201).json({ id: rs.insertId });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ message: 'Lỗi tạo nguyên liệu' });
  } finally {
    conn.release();
  }
};

exports.updateStock = async (req, res) => {
  const { quantity, min_threshold } = req.body;
  const fields = [];
  const params = [];
  if (quantity != null) { fields.push('quantity=?'); params.push(quantity); }
  if (min_threshold != null) { fields.push('min_threshold=?'); params.push(min_threshold); }
  if (!fields.length) return res.status(400).json({ message: 'Không có trường cần cập nhật' });

  params.push(req.params.id);
  await db.query(`UPDATE inventory SET ${fields.join(', ')} WHERE ingredient_id=?`, params);
  res.json({ message: 'Đã cập nhật kho' });
};
