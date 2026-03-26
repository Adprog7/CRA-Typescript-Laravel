import React, { useState, useEffect } from "react";
import { getWeekDates } from "../utils/getWeekDates";
import "../css/Matrix.css";

const toggleValue = (value) => {
  if (value === "") return "1";
  if (value === "1") return "0.5";
  if (value === "0.5") return "";
  return "";
};

export default function Matrix({ rows }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const week = getWeekDates(weekOffset);
  const cols = week.length;

  // 📌 Génère une clé unique pour la semaine
  const weekKey = (() => {
    const monday = week[0].date;
    const y = monday.getFullYear();
    const m = String(monday.getMonth() + 1).padStart(2, "0");
    const d = String(monday.getDate()).padStart(2, "0");
    return `week-${y}-${m}-${d}`;
  })();

  // 📌 Charger une matrice existante ou en créer une nouvelle
  const loadMatrix = () => {
    const saved = localStorage.getItem(weekKey);
    if (saved) {
      return JSON.parse(saved);
    }
    return Array.from({ length: rows }, () => Array(cols).fill(""));
  };

  const [matrix, setMatrix] = useState(loadMatrix);

  // 📌 Recharger la matrice lorsqu’on change de semaine
  useEffect(() => {
    setMatrix(loadMatrix());
  }, [weekKey]);

  // 📌 Sauvegarde dans localStorage à chaque modification
  const saveMatrix = (data) => {
    localStorage.setItem(weekKey, JSON.stringify(data));
  };

  const handleClick = (row, col) => {
    const updated = matrix.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? toggleValue(c) : c))
    );
    setMatrix(updated);
    saveMatrix(updated);
  };

  return (
    <div style={{ display: "inline-block", }}>
      {/* Navigation */}
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setWeekOffset(weekOffset - 1)}>⬅️ Semaine précédente</button>
        <button onClick={() => setWeekOffset(weekOffset + 1)} style={{ marginLeft: "10px" }}>
          Semaine suivante ➡️
        </button>
      </div>

      {/* Header : jours */}
      <div className="matrix-header">
        {week.map((d, i) => (
          <div key={i} className="matrix-day">
            {d.label}
          </div>
        ))}
      </div>

      {/* Matrice */}
      {matrix.map((row, i) => (
  <div key={i} className="matrix-row">
    {row.map((value, j) => (
      <div
        key={j}
        onClick={() => handleClick(i, j)}
        className={
          "matrix-cell " +
          (value === "1"
            ? "value-1"
            : value === "0.5"
            ? "value-05"
            : "value-empty")
        }
      >
        {value}
      </div>
    ))}
  </div>
))}
    </div>
  );
}
