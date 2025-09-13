// Báo cáo
const db = require('../db');

exports.lowStock = async (req, res) => {
  const [rows] = await db.query(
    `SELECT i.id, i.name, i.unit, inv.quantity, inv.min_threshold
     FROM inventory inv
     JOIN ingredients i ON i.id=inv.ingredient_id
     WHERE inv.quantity <= inv.min_threshold
     ORDER BY (inv.quantity - inv.min_threshold) ASC`
  );
  res.json(rows);
};

exports.inventorySnapshot = async (req, res) => {
  const [rows] = await db.query(
    `SELECT i.id, i.name, i.unit, inv.quantity, inv.min_threshold
     FROM inventory inv
     JOIN ingredients i ON i.id=inv.ingredient_id
     ORDER BY i.name ASC`
  );
  res.json(rows);
};

exports.receiptSummary = async (req, res) => {
  const { from, to } = req.query;
  const params = [];
  let sql =
    `SELECT DATE(r.created_at) as date, SUM(ri.qty * ri.price) as total_value, COUNT(DISTINCT r.id) as receipt_count
     FROM receipt_items ri
     JOIN receipts r ON r.id=ri.receipt_id
     WHERE 1=1`;
  if (from) { sql += ' AND DATE(r.created_at) >= ?'; params.push(from); }
  if (to)   { sql += ' AND DATE(r.created_at) <= ?'; params.push(to); }
  sql += ' GROUP BY DATE(r.created_at) ORDER BY DATE(r.created_at) DESC';
  const [rows] = await db.query(sql, params);
  res.json(rows);
};

exports.usageSummary = async (req, res) => {
  // nếu có bảng consumption & consumption_items thì tổng hợp,
  // còn không có dữ liệu thì trả mảng rỗng.
  const { from, to } = req.query;
  const params = [];
  let sql =
    `SELECT ci.ingredient_id, i.name, i.unit, SUM(ci.qty) as total_used
     FROM consumption_items ci
     JOIN consumption c ON c.id=ci.consumption_id
     JOIN ingredients i ON i.id=ci.ingredient_id
     WHERE 1=1`;
  if (from) { sql += ' AND DATE(c.created_at) >= ?'; params.push(from); }
  if (to)   { sql += ' AND DATE(c.created_at) <= ?'; params.push(to); }
  sql += ' GROUP BY ci.ingredient_id, i.name, i.unit ORDER BY i.name ASC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) {
    // nếu bảng chưa tồn tại hoặc chưa dùng, cứ trả rỗng cho nhẹ nhàng
    res.json([]);
  }
};
