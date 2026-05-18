import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWeekDates } from "../utils/getWeekDates";
import "../css/Matrix.css";

const toggleValue = (value) => {
  if (value === "") return "1";
  if (value === "1") return "0.5";
  if (value === "0.5") return "";
  return "";
};

const toISOLocal = (dateObj) => {
  const d = new Date(dateObj);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

export default function Matrix({ missions = [], userId, isClient = false }) {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const weekOffset = parseInt(searchParams.get("week") || "0", 10);

  const setWeekOffset = (newOffset) => {
    setSearchParams({ week: newOffset.toString() });
  };

  const [saveMessage, setSaveMessage] = useState("");
  const timeoutRef = useRef(null);

  const week = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const cols = week.length;
  const rows = missions.length;

  const startDate = toISOLocal(week[0].date);
  const endDate = toISOLocal(week[week.length - 1].date);

  const [matrix, setMatrix] = useState(() => Array.from({ length: rows }, () => Array(cols).fill("")));

  // Fetch CRA week
  const { data: craEntries = [] } = useQuery({
    queryKey: ['cra', userId, startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/cra/week?user_id=${userId}&startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Erreur lors de la récupération du CRA");
      return res.json();
    },
    enabled: missions.length > 0 && !!userId,
  });

  // Sync query data to local matrix draft state
  useEffect(() => {
    if (missions.length === 0) return;

    const newMatrix = Array.from({ length: missions.length }, () => Array(cols).fill(""));

    craEntries.forEach(entry => {
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
  }, [craEntries, missions, cols, week]);

  // Save CRA mutation
  const saveCraMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/cra/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Erreur de sauvegarde");
      return res.json();
    },
    onMutate: () => {
      setSaveMessage("Sauvegarde en cours...");
    },
    onSuccess: () => {
      setSaveMessage("CRA sauvegardé avec succès !");
      setTimeout(() => setSaveMessage(""), 4000);
      queryClient.invalidateQueries({ queryKey: ['cra', userId, startDate, endDate] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
    onError: (err) => {
      console.error(err);
      setSaveMessage("Erreur lors de la sauvegarde.");
    }
  });

  const handleClick = (row, col) => {
    if (isClient) return;
    const updated = matrix.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? toggleValue(c) : c))
    );
    setMatrix(updated);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setSaveMessage("En attente de sauvegarde...");

    timeoutRef.current = setTimeout(() => {
      handleValidate(updated);
    }, 1000);
  };

  const handleValidate = (matrixToSave = matrix) => {
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
      startDate: startDate,
      endDate: endDate,
      mission_ids: missions.map(m => m.id),
      entries: entries
    };

    saveCraMutation.mutate(payload);
  };

  return (
    <div className="matrix-wrapper">
      {isClient && (
        <div style={{ backgroundColor: '#2c3e50', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
          Vue Client - Lecture Seule
        </div>
      )}
      {/* Navigation */}
      <div className="matrix-navigation" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
        <button className="matrix-nav-btn" onClick={() => {
          setMatrix(Array.from({ length: rows }, () => Array(cols).fill("")));
          setWeekOffset(weekOffset - 1);
        }}>
          Semaine précédente
        </button>
        {saveMessage && (
          <span className="save-status-message" style={{ color: '#0066cc', fontWeight: '500', minWidth: '200px', textAlign: 'center' }}>
            {saveMessage}
          </span>
        )}
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
