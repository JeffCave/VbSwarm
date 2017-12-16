/******************************************************************************
 * 
 *****************************************************************************/
'use strict';


const bugParams = {
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

  /*** constructor ************************************************************
   *
   ***************************************************************************/
  constructor(swarm){
    this.pPos = [0,0];
    this.pHist = Array(100).map(function(){return Array(2).fill(0);});
    this.pVel = [0,0];
    
    this.swarm = swarm;
    this.closest = null;
  }
  
  
  
  get MAX_TRAIL_LEN(){
    return this.swarm.Params.TrailLen.val;
  }
  
  get pos(){ 
    return this.pPos;
  }
  
  get hist(){
    return this.pHist;
  }
  
  get vel(){
      return this.pVel;
  }
  
}