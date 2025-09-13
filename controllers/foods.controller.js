//Thư viện món ăn (foods + recipes)
const db = require('../db');

exports.list = async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM foods WHERE status="active" ORDER BY id DESC'
  );
  res.json(rows);
};

exports.get = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM foods WHERE id=?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy món' });
  res.json(rows[0]);
};

exports.create = async (req, res) => {
  const { name, description, group_name, kcal, price } = req.body;
  if (!name) return res.status(400).json({ message: 'Thiếu name' });
  const [rs] = await db.query(
    'INSERT INTO foods (name, description, group_name, kcal, price) VALUES (?,?,?,?,?)',
    [name, description || null, group_name || null, kcal || null, price || 0]
  );
  res.status(201).json({ id: rs.insertId });
};

exports.update = async (req, res) => {
  const { name, description, group_name, kcal, price, status } = req.body;
  await db.query(
    'UPDATE foods SET name=?, description=?, group_name=?, kcal=?, price=?, status=? WHERE id=?',
    [name, description || null, group_name || null, kcal || null, price || 0, status || 'active', req.params.id]
  );
  res.json({ message: 'Đã cập nhật' });
};

exports.remove = async (req, res) => {
  await db.query('UPDATE foods SET status="inactive" WHERE id=?', [req.params.id]);
  res.json({ message: 'Đã ẩn món (inactive)' });
};

exports.getRecipe = async (req, res) => {
  const [rows] = await db.query(
    `SELECT r.ingredient_id, i.name, i.unit, r.qty_per_portion, r.note
     FROM recipes r JOIN ingredients i ON i.id=r.ingredient_id
     WHERE r.food_id=?`,
    [req.params.id]
  );
  res.json(rows);
};

exports.setRecipe = async (req, res) => {
  // body: { items: [{ingredient_id, qty_per_portion, note?}, ...] }
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ message: 'items phải là mảng' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM recipes WHERE food_id=?', [req.params.id]);

    for (const it of items) {
      await conn.query(
        'INSERT INTO recipes (food_id, ingredient_id, qty_per_portion, note) VALUES (?,?,?,?)',
        [req.params.id, it.ingredient_id, it.qty_per_portion, it.note || null]
      );
    }

    await conn.commit();
    res.json({ message: 'Đã cập nhật công thức' });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ message: 'Lỗi cập nhật công thức' });
  } finally {
    conn.release();
  }
};
