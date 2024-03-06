// create a boid object
interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

class BoidObj {
    x: number;
    y: number;
    vx: number; 
    vy: number;
    biasval: number;
    color: Color;
    constructor(x:number,y:number, vx:number, vy:number, biasval:number, color:Color) {
        this.x = x ;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.biasval = biasval;
        this.color = color;
    }
    convertRgbToString = () => {
        return `rgba(${this.color.r},${this.color.g},${this.color.b}, ${this.color.a})`;
    }
}

export { BoidObj};
export type { Color };
