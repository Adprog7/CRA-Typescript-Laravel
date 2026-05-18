import React, { useState, useEffect, useRef } from "react";
import { getWeekDates } from "../utils/getWeekDates";
import "../css/Matrix.css";

const toggleValue = (value) => {
  if (value === "") return "1";
  if (value === "1") return "0.5";
  if (value === "0.5") return "";
  return "";
};

export default function Matrix({ missions = [], userId, isClient = false }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const timeoutRef = useRef(null);

  const week = getWeekDates(weekOffset);
  const cols = week.length;
  const rows = missions.length; // Calcul du compte de lignes dynamiquement

  const toISOLocal = (dateObj) => {
    const d = new Date(dateObj);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };

  // 📌 Génère une clé unique pour la semaine
  const weekKey = (() => {
    const monday = week[0].date;
    const y = monday.getFullYear();
    const m = String(monday.getMonth() + 1).padStart(2, "0");
    const d = String(monday.getDate()).padStart(2, "0");
    return `week-${y}-${m}-${d}`;
  })();

  const [matrix, setMatrix] = useState(() => Array.from({ length: rows }, () => Array(cols).fill("")));

  // 📌 Recharger la matrice depuis le backend lorsqu’on change de semaine
  useEffect(() => {
    if (missions.length === 0 || !userId) return;

    let isActive = true;

    const fetchCra = async () => {
      const startDate = toISOLocal(week[0].date);
      const endDate = toISOLocal(week[week.length - 1].date);
      
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/cra/week?user_id=${userId}&startDate=${startDate}&endDate=${endDate}`);
        const data = await res.json();
        
        if (!isActive) return;

        // Initialiser une matrice vide correspondant aux missions
        const newMatrix = Array.from({ length: missions.length }, () => Array(cols).fill(""));
        
        // Remplir avec les données du serveur
        data.forEach(entry => {
          const missionIndex = missions.findIndex(m => m.id === entry.mission_id);
          if (missionIndex !== -1) {
            const dayIndex = week.findIndex(d => toISOLocal(d.date) === entry.date);
            if (dayIndex !== -1) {
              const val = parseFloat(entry.time);
              newMatrix[missionIndex][dayIndex] = val === 1 ? "1" : val === 0.5 ? "0.5" : "";
            }
          }
        });
        
        setMatrix(newMatrix);
      } catch (err) {
        console.error("Erreur API:", err);
      }
    };

    fetchCra();

    return () => {
      isActive = false;
    };
  }, [weekKey, missions, userId]);

  const handleClick = (row, col) => {
    if (isClient) return; // Lecture seule pour les clients
    const updated = matrix.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? toggleValue(c) : c))
    );
    setMatrix(updated);
    
    // Auto-save logic with 1-second debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsSaving(true); // Indicate saving intent
    setSaveMessage("En attente de sauvegarde...");

    timeoutRef.current = setTimeout(() => {
      handleValidate(updated);
    }, 1000);
  };

  const handleValidate = async (matrixToSave = matrix) => {
    setIsSaving(true);
    setSaveMessage("Sauvegarde en cours...");
    
    const entries = [];
    matrixToSave.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value !== "") {
          entries.push({
            mission_id: missions[i].id,
            date: toISOLocal(week[j].date),
            time: parseFloat(value)
          });
        }
      });
    });

    const payload = {
      startDate: toISOLocal(week[0].date),
      endDate: toISOLocal(week[week.length - 1].date),
      mission_ids: missions.map(m => m.id),
      entries: entries
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/cra/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSaveMessage("CRA sauvegardé avec succès !");
        setTimeout(() => setSaveMessage(""), 4000);
      } else {
        setSaveMessage("Erreur lors de la sauvegarde.");
      }
    } catch (err) {
      console.error(err);
      setSaveMessage("Erreur réseau lors de la sauvegarde.");
    }
    setIsSaving(false);
  };

  return (
    <div className="matrix-wrapper">
      {isClient && (
        <div style={{ backgroundColor: '#2c3e50', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
           Vue Client - Lecture Seule
        </div>
      )}
      {/* Navigation */}
      <div className="matrix-navigation">
        <button className="matrix-nav-btn" onClick={() => {
          setMatrix(Array.from({ length: rows }, () => Array(cols).fill("")));
          setWeekOffset(weekOffset - 1);
        }}>
          Semaine précédente
        </button>
        <button className="matrix-nav-btn" onClick={() => {
          setMatrix(Array.from({ length: rows }, () => Array(cols).fill("")));
          setWeekOffset(weekOffset + 1);
        }}>
          Semaine suivante
        </button>
      </div>

      {/* Header : jours */}
      <div className="matrix-header">
        <div className="matrix-mission-label-header"></div> {/* Espace pour la colonne des noms des missions */}
        {week.map((d, i) => (
          <div key={i} className="matrix-day">
            {d.label}
          </div>
        ))}
      </div>

      {/* Matrice */}
      {missions.length === 0 ? (
        <p style={{ color: "#888", textAlign: "center", marginTop: "20px" }}>Aucune mission assignée. Vous ne pouvez pas remplir de CRA.</p>
      ) : (
        matrix.map((row, i) => (
          <div key={i} className="matrix-row-container">
            <div className="matrix-mission-label">
              <span>{missions[i]?.name || "Mission sans nom"}</span>
            </div>
            <div className="matrix-row">
              {row.map((value, j) => (
                <div
                  key={j}
                  onClick={() => handleClick(i, j)}
                  style={{ cursor: isClient ? 'default' : 'pointer' }}
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
          </div>
        ))
      )}

      {/* Footer Validation */}
      {missions.length > 0 && !isClient && (
        <div className="matrix-footer">
        </div>
      )}
    </div>
  );
}
