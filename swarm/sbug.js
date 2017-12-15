/*****************************************************************************
//* 
//****************************************************************************/
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

class sbug{

  /*** Class_Initialize *********************************************************
  *
  ******************************************************************************/
  constructor(swarm){
    this.pPos = [0,0];
    this.pHist = Array(100).map(function(){return Array(2).fill(0);});
    this.pVel = [0,0];
    
    this.swarm = swarm;
    this.closest = null;
  }
  /*** Class_Initialize ********************************************************/
  
  
  
  
  get ProgClass(){ // As String
    return "bug";
  }
  
  get MAX_TRAIL_LEN(){ //As Long
    return swarm.Params["TrailLen"].Val;
  }
  
  get pos(i /*As Long*/){ // As Double
    return this.pPos[i];
  }
  
  set pos(i,newPos){ //(i As Long, ByVal newPos As Double)
    this.pPos[i] = newPos;
  }
  
  get hist(x,y){ // (x As Long, y As Long) As Long
    return this.pHist[x, y];
  }
  
  set hist(x,y,newHist){ //(x As Long, y As Long, newHist As Long)
    this.pHist[x, y] = newHist;
  }
  
  get vel(i){
      return this.pVel[i];
  }
  
  
  //*** let vel *****************************************************************
  //*
  //*****************************************************************************
  set vel(i, newVel){
      this.pVel[i] = newVel;
  }
  //*** let vel *****************************************************************



}