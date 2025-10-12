import chaoGa from "../assets/chao-ga.jpg";
import canhRauNgot from "../assets/canh-rau-ngot.jpg";
import suaChua from "../assets/sua-chua.jpg";
import comTrang from "../assets/com-trang.jpg";
import duaHau from "../assets/dua-hau.jpg";
import xoiLac from "../assets/xoi-lac.jpg";
import thitBamXaoNgo from "../assets/thit-bam-xao-ngo.jpg";
import xoiGac from "../assets/xoi-gac.jpg";
import chaoHen from "../assets/chao-hen.jpg";
import giaXaoThitBo from "../assets/gia-xao-thit-bo.jpg";
import canhBiDo from "../assets/canh-bi-do.jpg";
import bapCaiLuoc from "../assets/rau-bap-cai-luoc.jpg";
import canhCaChua from "../assets/canh-ca-chua.jpg";
import trungRan from "../assets/trung-ran.jpg";
import thitKho from "../assets/thit-kho.jpg";
import chaoDauXanh from "../assets/chao-dau-xanh.jpg";

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
      "Bổ dưa hấu, bỏ hạt nếu muốn.",
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
  },
  {
    id: 7,
    ten: "Thịt băm xào ngô",
    anh: thitBamXaoNgo,
    nguyenLieu: ["Thịt băm", "Ngô ngọt", "Hành lá"],
    cheBien: [
      "Phi thơm hành, cho thịt vào xào chín.",
      "Thêm ngô ngọt, nêm gia vị.",
      "Đảo đều 5 phút là xong."
    ],
  },
  {
    id: 8,
    ten: "Xôi gấc",
    anh: xoiGac,
    nguyenLieu: ["Gạo nếp", "Gấc chín", "Đường", "Dừa nạo"],
    cheBien: [
      "Ngâm gạo nếp 6-8 tiếng, để ráo.",
      "Bổ gấc, lấy phần ruột trộn với gạo nếp và chút muối.",
      "Cho vào xửng hấp khoảng 30-40 phút.",
      "Khi xôi chín, trộn thêm chút đường và dừa nạo cho thơm."
    ],
  },
  {
    id: 9,
    ten: "Cháo hến",
    anh: chaoHen,
    nguyenLieu: ["Hến", "Gạo", "Hành phi"],
    cheBien: [
      "Hến làm sạch, luộc lấy nước.",
      "Nấu cháo bằng nước hến.",
      "Xào hến với hành, cho vào cháo."
    ],
  },
  {
    id: 10,
    ten: "Giá xào thịt bò",
    anh: giaXaoThitBo,
    nguyenLieu: ["Thịt bò", "Giá đỗ", "Tỏi"],
    cheBien: [
      "Thịt bò thái mỏng, ướp gia vị.",
      "Phi tỏi, xào bò nhanh.",
      "Cho giá vào đảo đều, nêm lại."
    ],
  },
  {
    id: 11,
    ten: "Canh bí đỏ",
    anh: canhBiDo,
    nguyenLieu: ["Bí đỏ", "Thịt băm", "Hành lá"],
    cheBien: [
      "Bí đỏ gọt vỏ, cắt miếng.",
      "Thịt băm xào sơ.",
      "Nấu bí đỏ với thịt, nêm vừa ăn."
    ],
  },
  {
    id: 12,
    ten: "Rau bắp cải luộc",
    anh: bapCaiLuoc,
    nguyenLieu: ["Bắp cải", "Nước", "Muối"],
    cheBien: [
      "Rửa sạch bắp cải, cắt khúc.",
      "Đun sôi nước với chút muối.",
      "Cho bắp cải vào luộc chín tới."
    ],
  },
  {
    id: 13,
    ten: "Canh cà chua",
    anh: canhCaChua,
    nguyenLieu: ["Cà chua", "Trứng", "Hành lá"],
    cheBien: [
      "Phi cà chua với dầu.",
      "Đổ nước sôi, nêm gia vị.",
      "Cho trứng đánh tan vào, khuấy đều."
    ],
  },
  {
    id: 14,
    ten: "Trứng rán",
    anh: trungRan,
    nguyenLieu: ["Trứng gà", "Hành lá", "Gia vị"],
    cheBien: [
      "Đập trứng, thêm hành lá và gia vị.",
      "Đánh đều rồi rán vàng 2 mặt."
    ],
  },
  {
    id: 15,
    ten: "Thịt kho",
    anh: thitKho,
    nguyenLieu: ["Thịt ba chỉ", "Nước mắm", "Đường", "Trứng"],
    cheBien: [
      "Thịt cắt miếng, ướp nước mắm đường.",
      "Kho với nước dừa.",
      "Cho trứng vào kho cùng."
    ],
  },
  {
    id: 16,
    ten: "Cháo đậu xanh",
    anh: chaoDauXanh,
    nguyenLieu: ["Gạo", "Đậu xanh", "Muối"],
    cheBien: [
      "Ngâm đậu xanh 2 tiếng.",
      "Nấu gạo và đậu xanh đến nhừ.",
      "Nêm chút muối, ăn nóng."
    ],
  },
];

export default monAn;