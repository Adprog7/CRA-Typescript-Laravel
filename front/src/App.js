import React from "react";
import Matrix from "./component/Matrix";

export default function App() {
  return (
    <div>
      <h1>Matrice</h1>
      <Matrix rows={3} cols={3} />
    </div>
  );
}