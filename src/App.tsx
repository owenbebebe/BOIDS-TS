import "./App.css";
import React, { useState, useEffect } from "react";
import Boid from "./comp/boids";

function App() {
  const [boidNum, setBoidNum] = useState<number>(2000);
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState<number>(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      const element = document.getElementById("environment");
      if (element) {
        const newWidth = element.offsetWidth;
        const newHeight = element.offsetHeight;
        if (newWidth !== screenWidth) {
          setScreenWidth(newWidth);
        }
        if (newHeight !== screenHeight) {
          setScreenHeight(newHeight);
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [screenWidth, screenHeight]);
  return (
    <div className="App">
      {/* NavBar setting */}
      {/* <div className="navbar">
        <div className="boidbtncontainer">
          <button onClick={handleCreateBoid} className="boidbtn">
            Create Boid
          </button>
        </div>
      </div> */}
      {/* environment  canvas*/}
      <div id="environment">
        <Boid
          boidNum={boidNum}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
        />
      </div>
    </div>
  );
}

export default App;
