// Code: Create a new boid object and div element
import React, { FC, useEffect, useState, useRef } from "react";
import { BoidObj, Color } from "../obj/boid";
import { group } from "console";

interface BoidProps {
  boidNum: number;
  screenWidth: number;
  screenHeight: number;
}

interface DotProps {
  x: number;
  y: number;
  radius: number;
  color: string;
}

type MousePosition = {
  x: number;
  y: number;
};

let boidsState: Array<BoidObj> = new Array(1500);

const Boid: FC<BoidProps> = ({ boidNum, screenWidth, screenHeight }) => {
  // GLOBAL VARIABLES
  // initiate the the ref element
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Usage example
  const [AVOIDFACTOR, setAvoidFactor] = useState<number>(0.1);
  const [MATCHINGFACTOR, setMatchingFactor] = useState<number>(0.2);
  const [CENTERINGFACTOR, setCenteringFactor] = useState<number>(0.01);
  const [PROTECTED_DISTANCE, setProtectedDistance] = useState<number>(125);
  const [VISUAL_RANGE, setVisualRange] = useState<number>(1000);
  const [GROUP_RANGE, setGroupRange] = useState<number>(10000);
  const [MINSPEED, setMinSpeed] = useState<number>(2);
  const [MAXSPEED, setMaxSpeed] = useState<number>(4);
  const [MAXBIAS, setMaxBias] = useState<number>(0.01);
  const [BIAS_INCREMENT, setBiasIncrement] = useState<number>(0.0001);
  const [BIASVAL, setBiasVal] = useState<number>(0.01);
  const [TURNFACTOR, setTurnFactor] = useState<number>(0.3);
  const [LIGHTCOLOR_FACTOR, setLightColorFactor] = useState<number>(0.1);
  const [COLOR_WEIGHT, setColorWeight] = useState<number>(0.001);
  const [r, setRadius] = useState<number>(1);
  let mousePosition: MousePosition = { x: 0, y: 0 };
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    }
  };
  //drawing a dot inside the canvas
  const drawDot = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    props: DotProps
  ) => {
    let { x, y, radius, color } = props;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      //----------------
      // DRAW A LINE
      // ctx.beginPath();
      // ctx.strokeStyle = color;
      // ctx.moveTo(x, y);
      // x = x + Math.sin(frame * 0.05) * 100;
      // y = y + Math.cos(frame * 0.05) * 100;
      // ctx.lineTo(x, y);
      // ctx.stroke();
      // ----------------
      // DRAW A DOT
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
    }
  };

  // First thing first translate the div generation part to a canvas element
  const initialBoids = () => {
    for (let i = 0; i < boidNum; i++) {
      const x = Math.floor(Math.random() * 200 + 100);
      const y = Math.floor(Math.random() * 200 + 100);
      const c: Color = {
        h: Math.floor(Math.random() * 360), //Math.floor(Math.random() * 256
        a: 1,
      };
      //create a div element
      boidsState[i] = new BoidObj(x, y, 0, 0, BIASVAL, c);
    }
  };

  //
  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, screenWidth, screenHeight);
    }
  };

  const getMousePosition = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Adjust for scaling if needed
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mousePosition = { x: x * scaleX, y: y * scaleY };
  };

  let c_prime: Set<number> = new Set();
  const updateBoid = (frame: number) => {
    clearCanvas();
    let c_prime: Set<number> = new Set();
    // Create C’ set of every boids number 0 - 2000
    for (let i = 0; i < boidNum; i++) {
      c_prime.add(i);
    }
    for (let i = 0; i < boidNum; i++) {
      let in_c: Boolean = false;
      //If i is in C’ <- we know that we found a new group leader
      if (c_prime.has(i)) {
        in_c = true;
        //remove i from c_prime
        c_prime.delete(i);
        // update its colorq
        // sin(x)
        boidsState[i].color.h =
          (Math.sin(frame * Math.PI) + 1) * boidsState[i].color.h;
        console.log(boidsState[i].color.h);
      }
      // checking the state before updating the position
      threeR(i, c_prime, in_c, frame);
      // update the color gradient
      // update the new position
      drawDot(canvasRef, {
        x: boidsState[i].x,
        y: boidsState[i].y,
        // mark alpha as bigger
        // radius: in_c ? 3 : 1,
        // universal mark
        radius: r,
        color: boidsState[i].convertColorToString(),
      });
    }
  };

  useEffect(() => {
    initCanvas();
    initialBoids();
    let frame = 0;
    let animationId: number | null = null;
    const animateBoids = () => {
      updateBoid(frame);
      frame++;
      animationId = requestAnimationFrame(animateBoids);
    };
    animateBoids();
    return () => {
      cancelAnimationFrame(animationId!);
    };
  }, []);

  const threeR = (
    i: number,
    c_prime: Set<number>,
    in_c: Boolean,
    frame: number
  ) => {
    let bs: BoidObj = boidsState[i];
    //1. initialize = 0
    let close_dx: number = 0;
    let close_dy: number = 0;
    let xvel_avg: number = 0;
    let yvel_avg: number = 0;
    let xpos_avg: number = 0;
    let ypos_avg: number = 0;
    let neighboring_boids: number = 0;
    let newx: number = bs.x;
    let newy: number = bs.y;
    let newvx: number = bs.vx;
    let newvy: number = bs.vy;
    let newbias: number = bs.biasval;

    //2. loop through all boids if the distance to another boid is less than visual range
    for (let j = 0; j < boidNum; j++) {
      let other: BoidObj = boidsState[j];
      if (other !== bs) {
        let dx: number = newx - other.x;
        let dy = newy - other.y;
        // check if absolute distance is less than visual range
        if (Math.abs(dx) < VISUAL_RANGE && Math.abs(dy) < VISUAL_RANGE) {
          let distance = dx * dx + dy * dy;
          if (in_c) {
            if (distance <= GROUP_RANGE && c_prime.has(j)) {
              //remove j from c_prime
              c_prime.delete(j);
              // check if the distnace is neg or positive
              // we know that it is a neg val
              if (distance / 2 < 5000) {
                boidsState[j].color.h =
                  -1 * ((distance / 2) * COLOR_WEIGHT) + bs.color.h;
              } else {
                boidsState[j].color.h =
                  (distance / 2) * COLOR_WEIGHT + bs.color.h;
              }
            } else if (distance <= GROUP_RANGE) {
              // we perform a merge function
              boidsState[j].color.h =
                ((boidsState[j].color.h + bs.color.h) / 2) *
                (Math.sin(frame * Math.PI) + 1);
            }
          }
          // for seperation
          if (distance <= PROTECTED_DISTANCE) {
            close_dx += dx;
            close_dy += dy;
          } else if (distance < VISUAL_RANGE) {
            xvel_avg += other.vx;
            yvel_avg += other.vy;
            xpos_avg += other.x;
            ypos_avg += other.y;
            neighboring_boids++;
            // calculate the color
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
      newvx =
        newvx +
        (xpos_avg - newx) * CENTERINGFACTOR +
        (xvel_avg - newvx) * MATCHINGFACTOR;
      newvy =
        newvy +
        (ypos_avg - newy) * CENTERINGFACTOR +
        (yvel_avg - newvy) * MATCHINGFACTOR;
      // -------------------------
      // update the colo
      // newColor = Math.atan(newvy / newvx) * (180 / Math.PI);
      // -------------------------
    }
    //3. Seperation update the velocity of the boid
    newvx += close_dx * AVOIDFACTOR;
    newvy += close_dy * AVOIDFACTOR;
    // 4. Check for turns
    // check if touched top side
    if (newy < 200) {
      newvy = newvy + TURNFACTOR;
    }
    //check if touched bottom side
    if (newy > screenHeight - 200) {
      newvy = newvy - TURNFACTOR;
    }
    //check if touched left side
    if (newx < 200) {
      newvx = newvx + TURNFACTOR;
    }
    //check if touched right side
    if (newx > screenWidth - 200) {
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
    // 1.5 whck for if the current boid is in the distance of the moouse
    if (mousePosition) {
      let dx = newx - mousePosition.x;
      let dy = newy - mousePosition.y;
      let distance = dx * dx + dy * dy;
      if (distance < 1500) {
        newvx += dx * MATCHINGFACTOR;
        newvy += dy * MATCHINGFACTOR;
      }
    }
    // -------------------------
    // console.log(boidsState[i].color.h);
    // -------------------------
    // update the position of the boid
    newx += newvx;
    newy += newvy;
    // update the boid color brightness based on the number of neighboring boids
    let opc = neighboring_boids * LIGHTCOLOR_FACTOR;
    // update the boid's state
    boidsState[i].x = newx;
    boidsState[i].y = newy;
    boidsState[i].vx = newvx;
    boidsState[i].vy = newvy;
    boidsState[i].biasval = newbias;
    boidsState[i].color.a = opc;
    // boidsState[i].color.h = newColor;
  };

  return (
    <canvas ref={canvasRef} onMouseMove={getMousePosition} id="canvas"></canvas>
  );
};

export default Boid;
