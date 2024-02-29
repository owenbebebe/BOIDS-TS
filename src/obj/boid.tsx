// create a boid object
class BoidObj {
    x: number;
    y: number;
    vx: number; 
    vy: number;
    biasval: number;
    constructor(x:number,y:number, vx:number, vy:number, biasval:number) {
        this.x = x ;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.biasval = biasval;
    }
    


}

export { BoidObj };