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

const AVOIDFACTOR: number = 0.15;
const MATCHINGFACTOR: number = 0.15;
const CENTERINGFACTOR: number = 0.0005;
const PROTECTED_DISTANCE: number = 9;
const VISUAL_RANGE: number = 42;
const MINSPEED: number = 3;
const MAXSPEED: number = 5;
const MAXBIAS: number = 0.01;
const BIAS_INCREMENT: number = 0.002;
const BIASVAL: number = 0.002;
var hasMounted: number = 0;

const Boid: FC<BoidProps> = ({ boidNum }) => {
  let [boidsState, setBoidsState] = useState<
    Array<{ x: number; y: number; vx: number; vy: number; biasval: number }>
  >(() => {
    let initialBoids: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      biasval: number;
    }[] = [];
    if (hasMounted == 0) {
      hasMounted = 1;
    } else if (hasMounted == 1) {
      for (let i = 0; i < boidNum; i++) {
        const x = Math.floor(Math.random() * 100);
        const y = Math.floor(Math.random() * 100);
        const vx: number = 0;
        const vy: number = 0;
        const biasval: number = BIASVAL;
        initialBoids[i] = { x, y, vx, vy, biasval };
      }
      hasMounted = 2;
    }
    return initialBoids;
  });

  let framer = 0;
  const animateBoids = () => {
    framer++;
    if (framer % 3 === 0) {
      setBoidsState((boidsState) =>
        boidsState.map((bs) => {
          // Update boid position here...
          //print the index of each boid
          let re = threeR(bs);
          return { x: re[0], y: re[1], vx: re[2], vy: re[3], biasval: re[4] };
        })
      );
    }
    requestAnimationFrame(animateBoids);
  };
  // }; // Remove this extra closing curly brace

  useEffect(() => {
    const animationId = requestAnimationFrame(animateBoids);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // SEPERATION && ALIGNMENT && COHESION
  // if boid is too close to another boid (inside its protected range), move away
  // move towards the center of mass of the neighboring boids
  // match the velocity boids inside visible range
  const threeR = (boid: any) => {
    //1. initialize = 0
    let close_dx: number = 0;
    let close_dy: number = 0;
    let xvel_avg: number = 0;
    let yvel_avg: number = 0;
    let xpos_avg: number = 0;
    let ypos_avg: number = 0;
    let neighboring_boids: number = 0;
    //2. loop through all boids if the distance to another boid is less than visual range
    for (let i = 0; i < boidNum; i++) {
      let other = boidsState[i];
      if (other !== boid) {
        let dx = boid.x - other.x;
        let dy = boid.y - other.y;
        // check if absolute distance is less than visual range
        if (Math.abs(dx) < VISUAL_RANGE && Math.abs(dy) < VISUAL_RANGE) {
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= VISUAL_RANGE && distance > PROTECTED_DISTANCE) {
            xvel_avg += other.vx;
            yvel_avg += other.vy;
            xpos_avg += other.x;
            ypos_avg += other.y;
            neighboring_boids++;
          }
          //for seperation
          if (distance <= PROTECTED_DISTANCE) {
            close_dx += dx;
            close_dy += dy;
          }
        }
      }
    }
    console.log("neighboring_boids", neighboring_boids);
    //3. Seperation update the velocity of the boid
    boid.vx += close_dx * AVOIDFACTOR;
    boid.vy += close_dy * AVOIDFACTOR;
    //3. if there are neighboring boids, update the velocity and position of the boid
    if (neighboring_boids > 0) {
      xvel_avg /= neighboring_boids;
      yvel_avg /= neighboring_boids;
      xpos_avg /= neighboring_boids;
      ypos_avg /= neighboring_boids;
      //update the velocity of the boid
      boid.vx += (xvel_avg - boid.vx) * MATCHINGFACTOR;
      boid.vy += (yvel_avg - boid.vy) * MATCHINGFACTOR;
      boid.vx += (xpos_avg - boid.x) * CENTERINGFACTOR;
      boid.vy += (ypos_avg - boid.y) * CENTERINGFACTOR;
    }
    // 4. Check for turns
    // check if touched top side
    if (boid.y < 0) {
      boid.vy = -boid.vy;
    }
    //check if touched bottom side
    if (boid.y > 500) {
      boid.vy = -boid.vy;
    }
    //check if touched left side
    if (boid.x < 0) {
      boid.vx = -boid.vx;
    }
    //check if touched right side
    if (boid.x > 500) {
      boid.vx = -boid.vx;
    }
    // BIAS
    if (boid.vx > 0) {
      boid.biasval = Math.min(MAXBIAS, boid.biasval + BIAS_INCREMENT);
    } else {
      boid.biasval = Math.max(BIAS_INCREMENT, boid.biasval - BIAS_INCREMENT);
    }
    // if there's a bias value, update the velocity of the boid
    if (boid.biasval > 0) {
      boid.vx = (1 - boid.biasval) * boid.vx + boid.biasval * 1;
    } else if (boid.biasval < 0) {
      boid.vx = (1 - boid.biasval) * boid.vx + boid.biasval * -1;
    }
    // calculate boid's speed
    let speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
    // set min and max speed
    if (speed < MINSPEED && boid.vx !== 0 && boid.vy !== 0) {
      boid.vx = (boid.vx / speed) * MINSPEED;
      boid.vy = (boid.vy / speed) * MINSPEED;
    }
    if (speed > MAXSPEED && boid.vx !== 0 && boid.vy !== 0) {
      boid.vx = (boid.vx / speed) * MAXSPEED;
      boid.vy = (boid.vy / speed) * MAXSPEED;
    }
    // update the position of the boid
    boid.x += boid.vx;
    boid.y += boid.vy;
    return [boid.x, boid.y, boid.vx, boid.vy, boid.biasval];
  };
  return (
    <div>
      {boidsState.map((boid, index) => (
        <div
          className={"boid"}
          key={index}
          style={{ transform: `translate(${boid.x}px, ${boid.y}px)` }}
        ></div>
      ))}
    </div>
  );
};

export default Boid;
