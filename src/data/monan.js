import chaoGa from "../assets/chao-ga.jpg";
import canhRauNgot from "../assets/canh-rau-ngot.jpg";
import suaChua from "../assets/sua-chua.jpg";
import comTrang from "../assets/com-trang.jpg";
import duaHau from "../assets/dua-hau.jpg";
import xoiLac from "../assets/xoi-lac.jpg";

const monAn = [
  {
    id: 1,
    ten: "Cháo gà",
    anh: chaoGa,
    nguyenLieu: ["Thịt gà", "Cà rốt", "Gạo"],
    cheBien: [
      "Thịt gà và cà rốt băm nhỏ, xào chín.",
      "Nấu cháo từ gạo cho nhừ.",
      "Cho hỗn hợp gà và cà rốt vào cháo, khuấy đều.",
      "Đun sôi thêm 2-3 phút là hoàn thành."
    ],
  },
  {
    id: 2,
    ten: "Canh rau ngót",
    anh: canhRauNgot,
    nguyenLieu: ["Rau ngót", "Thịt băm", "Hành tím"],
    cheBien: [
      "Rau ngót rửa sạch, vò nhẹ.",
      "Thịt băm xào sơ với hành tím.",
      "Cho thịt vào nồi nước sôi, thêm rau ngót.",
      "Nêm gia vị vừa ăn, nấu chín rau rồi tắt bếp."
    ],
  },
  {
    id: 3,
    ten: "Sữa chua",
    anh: suaChua,
    nguyenLieu: ["Sữa đặc", "Sữa tươi", "Men sữa chua"],
    cheBien: [
      "Pha sữa đặc với sữa tươi ấm.",
      "Thêm men sữa chua, khuấy đều.",
      "Rót vào hũ, ủ khoảng 6-8 tiếng.",
      "Bảo quản trong ngăn mát trước khi dùng."
    ],
  },
  {
    id: 4,
    ten: "Cơm trắng",
    anh: comTrang,
    nguyenLieu: ["Gạo", "Nước"],
    cheBien: [
      "Vo gạo sạch, cho vào nồi.",
      "Thêm lượng nước phù hợp.",
      "Bật nồi cơm điện, nấu chín.",
      "Xới cơm cho tơi trước khi ăn."
    ],
  },
  {
    id: 5,
    ten: "Dưa hấu",
    anh: duaHau,
    nguyenLieu: ["Dưa hấu tươi chín đỏ"],
    cheBien: [
      "Rửa sạch vỏ dưa hấu.",
      "Bổ dưa hấu, bỏ hạt (nếu muốn).",
      "Cắt thành miếng vừa ăn.",
      "Dùng lạnh sẽ ngon hơn."
    ],
  },
  {
    id: 6,
    ten: "Xôi lạc",
    anh: xoiLac,
    nguyenLieu: ["Gạo nếp", "Lạc (đậu phộng)", "Muối"],
    cheBien: [
      "Ngâm gạo nếp 6-8 tiếng, lạc ngâm mềm.",
      "Trộn gạo với lạc và chút muối.",
      "Cho vào xửng hấp khoảng 30-40 phút.",
      "Xới đều và hấp thêm 5 phút là xong."
    ],
  }
];

export default monAn;