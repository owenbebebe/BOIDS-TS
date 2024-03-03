// create a boid object
class BoidObj {
    x: number;
    y: number;
    vx: number; 
    vy: number;
    biasval: number;
    color: string;
    constructor(x:number,y:number, vx:number, vy:number, biasval:number, color:string) {
        this.x = x ;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.biasval = biasval;
        this.color = color;
    }
    


}

export { BoidObj };