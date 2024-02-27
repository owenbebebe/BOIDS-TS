import "./App.css";
import React, { useState } from "react";
import Boid from "./comp/boids";

function App() {
  const [boidNum, setBoidNum] = useState<number>(100);

  const handleCreateBoid = () => {
    setBoidNum(boidNum + 1);
  };
    const handleDivClick = (index: number) => {
      console.log('Div', index + 1, 'clicked!');
    };
  return (
    <div className="App center">
      {/* NavBar setting */}
      <div className="navbar">
        <div className="boidbtncontainer">
          <button onClick={handleCreateBoid} className="boidbtn">
            Create Boid
          </button>
        </div>
      </div>
      {/* environment  canvas*/}
      <div id="environment">
        <Boid boidNum={boidNum}/> 
      </div>
    </div>
  );
}

export default App;
