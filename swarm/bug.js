/******************************************************************************
 * 
 *****************************************************************************/
'use strict';

/* global miscMath */


const bugParams = {
    'framesPerSecond': 10,
    'dt' : 0.3,
    'targetVel' : 0.03,
    'targetAcc' : 0.02,
    'maxVel' : 0.05,
    'maxAcc' : 0.03,
    'noise' : 0.01,
    'noise' : 0.05,
    'nbugs' : -1,
    'ntargets' : -1,
    'trailLen' : 60,
    'colorScheme' : 2,
    'changeProb' : 0.15,
};

class sBug{

  /**
   * constructor
   *
   */
  constructor(swarm){
    this.pPos = [0,0];
    this.pVel = [0,0];
    
    this.swarm = swarm;
    this.closest = null;
    
    this.pos[0] = Math.random();
    this.pos[1] = Math.random();
    
    this.vel[0] = Math.random() * this.swarm.targetVel / 2;
    this.vel[1] = Math.random() * this.swarm.targetVel / 2;
    
    this.hist.push(JSON.clone(this.pos));
    
  }
  
  
  
  get MAX_TRAIL_LEN(){
    return this.swarm.Params.TrailLen.val;
  }
  
  get pos(){ 
    return this.pPos;
  }
  
  get hist(){
    if(typeof this.pHist === 'undefined'){
      this.pHist = [];
    }
    return this.pHist;
  }
  
  get vel(){
      return this.pVel;
  }
  
  get isPrey(){
    return this.closest === null;
  }
  
  updateDirection(){
    let newDir = 0;
    let velSq = 0;
    let maxVel = 0;
    let acc = 0;
    if(this.isPrey){
      velSq = this.swarm.targetVelSq;
      maxVel = this.swarm.targetVel;
      acc = this.swarm.targetAcc;
      newDir = Math.random() * Math.PI * 2;
    }
    else{
      velSq = this.swarm.maxVelSq;
      maxVel = this.swarm.maxVel;
      acc = this.swarm.maxAcc;
      
      // apply some randomness (+/-)
      // this simulates the the innefficiencies of biologic entities in the 
      // real world. We only estimate things, so our there is always some
      // random variation in our predictions. Also accounts for unclear
      // conditions such as fog or dust which may confuse things. An 
      // interesting change may be to apply the noise at the individual bug
      // level and change it based on external conditions. External 
      // conditions could be age (senility), proximity of other potential 
      // targets (distracted)
      newDir = this.swarm.noise * (Math.random() - 0.5);
      // Calculate the direction the predator needs to travel 
      // to intercept its prey
      let y = this.closest.pos[1] - this.pos[1];
      let x = this.closest.pos[0] - this.pos[0];
      newDir += Math.atan(y,x);
    }
    let x = acc * Math.cos(newDir);
    let y = acc * Math.sin(newDir);
    
    this.vel[0] += x * this.swarm.dt;
    this.vel[1] += y * this.swarm.dt;
    
    /* check velocity */
    newDir = Math.pow(this.vel[0],2) + Math.pow(this.vel[1],2);
    if (newDir > velSq) {
      newDir = maxVel / Math.pow(newDir,0.5);
      /* save old vel for acc computation */
      x = this.vel[0];
      y = this.vel[1];
      
      /* compute new velocity */
      this.vel[0] *= newDir;
      this.vel[1] *= newDir;
      
      /* update acceleration */
      x = (this.vel[0] - x) * this.swarm.dtInv;
      y = (this.vel[1] - y) * this.swarm.dtInv;
    }
    
    /* update position */
    this.pos[0] += (this.vel[0] * this.swarm.dt + x * this.swarm.halfDtSq);
    this.pos[1] += (this.vel[1] * this.swarm.dt + y * this.swarm.halfDtSq);
    
    // prey is not allowed to leave the game board
    if(this.isPrey){
      /* check limits on targets */
      if (this.pos[0] < 0){
        /* bounce */
        this.vel[0] = Math.abs(this.vel[0]);
        this.pos[0] = 0;
        
      }
      else if(this.pos[0] >= 1) {
        /* bounce */
        this.vel[0] = -1 * Math.abs(this.vel[0]);
        this.pos[0] = 1;
      }
      if (this.pos[1] < 0){
        /* bounce */
        this.vel[1] = Math.abs(this.vel[1]);
        this.pos[1] = 0;
        
      }
      else if(this.pos[1] >= 1) {
        /* bounce */
        this.vel[1] = -1 * Math.abs(this.vel[1]);
        this.pos[1] = 1;
      }
    }
    
    this.hist.unshift(JSON.clone(this.pos));
    if(this.hist.length > this.swarm.trailLen) {
      this.hist.pop();
    }
  }
  
  spotNewPrey(targets){
    if(this.isPrey) return;
    
    let bug = this;
    
    // based on the x/y coordinates of the bug, and it's closest target, use
    // pythagorean theorum to determine its distance
    let x = bug.closest.pos[0] - bug.pos[0];
    let y = bug.closest.pos[1] - bug.pos[1];
    let dist = Math.pow(x,2) + Math.pow(y,2);
    targets.forEach(function(targ,i){
      // if this is already the one marked closest, there is nothing to check
      if (targ === bug.closest) return;
      
      // if this item is closer than the one we think is closest, mark this
      // one as the closest
      let x = targ.pos[0] - bug.pos[0];
      let y = targ.pos[1] - bug.pos[1];
      let newDist = Math.pow(x,2) + Math.pow(y,2);
      
      // our creature does not want to give up the chase, it will stay 
      // focussed on its prey. However if another prey animal is *really* 
      // close (say half the distance) it breaks off its current chase and 
      // goes for the one even closer
      if (newDist * 2 < dist) {
        bug.closest = targ;
        dist = newDist;
      }
    });
  }
  
}