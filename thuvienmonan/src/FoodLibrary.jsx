import React from "react";
import "./FoodLibrary.css";

export default function FoodLibrary() {
  const foods = [
    { name: "Cháo gà", img: "/chao-ga.png" },
    { name: "Canh rau ngót", img: "/canh-rau-ngot.png" },
    { name: "Sữa chua", img: "/sua-chua.png" },
    { name: "Cơm trắng", img: "/com-trang.png" },
    { name: "Dưa hấu", img: "/dua-hau.png" },
    { name: "Xôi lạc", img: "/xoi-lac.png" },
  ];

  return (
    <div className="container">
      <div className="header">THƯ VIỆN MÓN ĂN</div>
      <div className="grid">
        {foods.map((food, index) => (
          <div key={index} className="card">
            <img src={food.img} alt={food.name} className="food-img" />
            <div className="food-name">{food.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}