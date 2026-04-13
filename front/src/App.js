import React from "react";
import Matrix from "./component/Matrix";
import "./App.css"; // Import du style global (fond noir)
import "./css/Matrix.css"; // Import du style de la matrice

export default function App() {
  return (
    <div className="App">
      <div className="App-header">
        {/* Titre stylisé en vert */}
        <h1 className="main-title">PROJET <span className="highlight">CRA</span></h1>
        
        {/* Ta matrice est automatiquement centrée par le CSS de App-header */}
        <Matrix rows={5} /> 
      </div>
    </div>
  );
}