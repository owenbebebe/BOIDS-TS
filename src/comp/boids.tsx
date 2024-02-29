// Code: Create a new boid object and div element
import React, {
  Dispatch,
  SetStateAction,
  FC,
  useEffect,
  useState,
  useRef,
} from "react";
import { BoidObj } from "../obj/boid";

interface BoidProps {
  boidNum: number;
}

// GLOBAL VARIABLES
let boidsState: Array<BoidObj> = new Array(100);

const Boid: FC<BoidProps> = ({ boidNum }) => {
  // Usage example
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState<number>(window.innerHeight);
  const [AVOIDFACTOR, setAvoidFactor] = useState<number>(0.04);
  const [MATCHINGFACTOR, setMatchingFactor] = useState<number>(0.05);
  const [CENTERINGFACTOR, setCenteringFactor] = useState<number>(0.005);
  const [PROTECTED_DISTANCE, setProtectedDistance] = useState<number>(20);
  const [VISUAL_RANGE, setVisualRange] = useState<number>(40);
  const [MINSPEED, setMinSpeed] = useState<number>(2);
  const [MAXSPEED, setMaxSpeed] = useState<number>(4);
  const [MAXBIAS, setMaxBias] = useState<number>(0.01);
  const [BIAS_INCREMENT, setBiasIncrement] = useState<number>(0.00004);
  const [BIASVAL, setBiasVal] = useState<number>(0.0);
  const [TURNFACTOR, setTurnFactor] = useState<number>(0.2);
  // const [boidsState, setBoidsState] = useState<Array<BoidObj>>([]);
  // const [boidsState, setBoidsState] = useState<Array<BoidObj>>(() => {
  //   let initialBoids = [];
  //   if (hasMounted == 0) {
  //     hasMounted = 1;
  //   } else if (hasMounted == 1) {
  //     for (let i = 0; i < boidNum; i++) {
  //       const x = Math.floor(Math.random() * 100);
  //       const y = Math.floor(Math.random() * 100);
  //       initialBoids.push(new BoidObj(x, y, 0, 0, BIASVAL));
  //     }
  //     hasMounted = 2;
  //   }
  //   console.log("boidsState", initialBoids);
  //   return initialBoids;
  // });

  const initialBoids = () => {
    for (let i = 0; i < boidNum; i++) {
      const x = Math.floor(Math.random() * 100);
      const y = Math.floor(Math.random() * 100);
      //create a div element
      const boidDiv = document.createElement("div");
      //give it a class name
      boidDiv.className = "boid";
      boidDiv.style.transform = `translate(${x}px, ${y}px)`;
      //append it to the div with the id "boid-container"
      const env = document.getElementById("environment");
      env?.appendChild(boidDiv);
      boidsState[i] = new BoidObj(x, y, 0, 0, BIASVAL);
    }
    console.log("init", boidsState);
  };

  const clearDiv = () => {
    const env = document.getElementById("environment");
    //clear every div inside the environment
    while (env?.firstChild) {
      env.removeChild(env.firstChild);
    }
  };

  const updateBoid = () => {
    clearDiv();
    for (let i = 0; i < boidNum; i++) {
      threeR(i);
      const boidDiv = document.createElement("div");
      //give it a class name
      boidDiv.className = "boid";
      boidDiv.style.transform = `translate(${boidsState[i].x}px, ${boidsState[i].y}px)`;
      //append it to the div with the id "boid-container"
      const env = document.getElementById("environment");
      env?.appendChild(boidDiv);
    }
  };

  const animateBoids = () => {
    updateBoid();
    requestAnimationFrame(animateBoids);
  };

  useEffect(() => {
    initialBoids();
    const animationId = requestAnimationFrame(animateBoids);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const threeR = (i: number) => {
    let bs = boidsState[i];
    //1. initialize = 0
    let close_dx: number = 0;
    let close_dy: number = 0;
    let xvel_avg: number = 0;
    let yvel_avg: number = 0;
    let xpos_avg: number = 0;
    let ypos_avg: number = 0;
    let neighboring_boids: number = 0;
    let newx = bs.x;
    let newy = bs.y;
    let newvx = bs.vx;
    let newvy = bs.vy;
    let newbias = bs.biasval;

    //2. loop through all boids if the distance to another boid is less than visual range
    for (let i = 0; i < boidNum; i++) {
      let other = boidsState[i];
      if (other !== bs) {
        let dx = newx - other.x;
        let dy = newy - other.y;
        // check if absolute distance is less than visual range
        if (Math.abs(dx) < VISUAL_RANGE && Math.abs(dy) < VISUAL_RANGE) {
          let distance = dx * dx + dy * dy;
          //for seperation
          if (distance <= PROTECTED_DISTANCE) {
            close_dx += dx;
            close_dy += dy;
          } else if (distance < VISUAL_RANGE) {
            xvel_avg += other.vx;
            yvel_avg += other.vy;
            xpos_avg += other.x;
            ypos_avg += other.y;
            neighboring_boids++;
          }
        }
      }
    }
    //3. if there are neighboring boids, update the velocity and position of the boid
    if (neighboring_boids > 0) {
      xvel_avg /= neighboring_boids;
      yvel_avg /= neighboring_boids;
      xpos_avg /= neighboring_boids;
      ypos_avg /= neighboring_boids;

      // -------------------------
      newvx =
        newvx +
        (xpos_avg - newx) * CENTERINGFACTOR +
        (xvel_avg - newvx) * MATCHINGFACTOR;
      newvy =
        newvy +
        (ypos_avg - newy) * CENTERINGFACTOR +
        (yvel_avg - newvy) * MATCHINGFACTOR;
      // -------------------------
    }
    let copmarex = newvx;
    let copmarey = newvy;
    //3. Seperation update the velocity of the boid
    newvx += close_dx * AVOIDFACTOR;
    newvy += close_dy * AVOIDFACTOR;
    if (copmarex === newvx && copmarey === newvy) {
      console.log("yes");
    }
    // 4. Check for turns
    // check if touched top side
    if (newy < 100) {
      newvy = newvy + TURNFACTOR;
    }
    //check if touched bottom side
    if (newy > screenHeight - 100) {
      newvy = newvy - TURNFACTOR;
    }
    //check if touched left side
    if (newx < 100) {
      newvx = newvx + TURNFACTOR;
    }
    //check if touched right side
    if (newx > screenWidth - 100) {
      newvx = newvx - TURNFACTOR;
    }
    // BIAS
    if (newvx > 0) {
      newbias = Math.min(MAXBIAS, newbias + BIAS_INCREMENT);
    } else {
      newbias = Math.max(BIAS_INCREMENT, newbias - BIAS_INCREMENT);
    }
    // if there's a bias value, update the velocity of the boid
    if (newbias > 0) {
      newvx = (1 - newbias) * newvx + newbias * 1;
    } else if (newbias < 0) {
      newvx = (1 - newbias) * newvx + newbias * -1;
    }
    // calculate boid's speed
    let speed = Math.sqrt(newvx * newvx + newvy * newvy);
    // set min and max speed
    if (speed < MINSPEED && newvx !== 0 && newvy !== 0) {
      newvx = (newvx / speed) * MINSPEED;
      newvx = (newvy / speed) * MINSPEED;
    }
    if (speed > MAXSPEED && newvx !== 0 && newvy !== 0) {
      newvx = (newvx / speed) * MAXSPEED;
      newvy = (newvy / speed) * MAXSPEED;
    }
    // update the position of the boid
    newx += newvx;
    newy += newvy;
    // update the boid's state
    boidsState[i].x = newx;
    boidsState[i].y = newy;
    boidsState[i].vx = newvx;
    boidsState[i].vy = newvy;
    boidsState[i].biasval = newbias;
  };

  return <div></div>;
};

export default Boid;
