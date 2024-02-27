// create a boid object
class BoidObj {
    x: number;
    y: number;
    vx: number; 
    vy: number;
    constructor(x:number,y:number) {
        this.x = x ;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
    }
    


}

export { BoidObj };