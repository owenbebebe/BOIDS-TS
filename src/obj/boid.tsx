type Color = {
    h: number;
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
    convertColorToString = () => {
        return `hsla(${this.color.h},100% ,50%, ${this.color.a})`;
    }
}

export { BoidObj};
export type { Color };
