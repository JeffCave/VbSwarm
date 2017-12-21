/******************************************************************************
 * This code Modified from its original C source by Jeff Cave
 *****************************************************************************/
/*
 * Copyright (c) 2000 by Chris Leger (xrayjones@users.sourceforge.net)
 *
 * xrayswarm - a shameless ripoff of the //swarm// screensaver on SGI
 *   boxes.
 *
 * Version 1.0 - initial release.  doesn//t read any special command-line
 *   options, and only supports the variable //delay// via Xresources.
 *   (the delay resouces is most useful on systems w/o gettimeofday, in
 *   which case automagical level-of-detail for FPS maintainance can//t
 *   be used.)
 *
 *   The code isn't commented, but isn't too ugly. It should be pretty
 *   easy to understand, with the exception of the colormap stuff.
 *
 */
/*
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, %ify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE X CONSORTIUM BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

Except as contained in this notice, the name of the X Consortium shall
not be used in advertising or otherwise to promote the sale, use or
other dealings in this Software without prior written authorization
from the X Consortium.
*/
'use strict';

/* global sBug, global bugParams, global RGB */

class Swarm{
  
  
  constructor(canvas){
    this.callDepth = 0;
    
    this.good1 = bugParams;
    this.Continue = true;
    
    this.CreateParams();
    this.initVar();
  }
  
  
  
  /**
   * initVar
   * 
   * In the 'C' version, there are a lot of variables that are initialized at
   * the same time that they are declared. Since this is not possible in VB, 
   * we call initVar to initialize them when the class is created.
   */
  initVar(){
    this.good1.trailLen = this.Params.trailLen;
    
    this.goodParams = [];
    this.goodParams.push(this.good1);
    
    this.changeProb = 0.08;
    
    this.dt = this.good1.dt;
    this.fps = this.good1.framesPerSecond;
    this.msPerFrame = Math.floor(1000/this.fps);
    this.targetVel = this.good1.targetVel;
    this.targetAcc = this.good1.targetAcc;
    this.maxVel = this.good1.maxVel;
    this.maxAcc = this.good1.maxAcc;
    this.noise = this.good1.noise;
    this.minVelMultiplier = 0.5;
    
  }
  
  
  
  /**
   * get MAX_TRAIL_LEN
   */
  get MAX_TRAIL_LEN(){
    let max = this.Params.trailLen.max;
    return max;
  }

  
  
  get MAX_BUGS     (){ return 50;  }
  get MAX_TARGETS  (){ return 5;   }
  get MAX_TOTBUGS  (){ return  this.MAX_BUGS + this.MAX_TARGETS;}
  get MAX_FPS      (){ return 150; }
  get MIN_FPS      (){ return 16;  }
  get DESIRED_DT   (){ return 0.2; }
  get numParamSets (){ return 1;   }
  
  
  /**
   * clearBugs
   * 
   * Clear the screen of bugs
   */
  clearBugs(){
    Array
      .from(this.win.querySelectorAll('*'))
      .forEach(function(path){
        path.parentNode.removeChild(path);
      });
  }
  
  
  
  /**
   * computeConstants
   *
   */
  computeConstants(){
    this.halfDtSq = Math.pow(this.dt,2) * 0.5;
    this.dtInv = 1 / this.dt;
    this.targetVelSq = Math.pow(this.targetVel,2);
    this.maxVelSq = Math.pow(this.maxVel,2);
    this.minVel = this.maxVel * this.minVelMultiplier;
    this.minVelSq = Math.pow(this.minVel,2);
  }
  
  
  
  /**
   * drawBugs
   *
   */
  drawBugs(scheme){
    let colours = this.trails[scheme];

    let paths = Array.from(this.win.querySelectorAll('g'));
    while (paths.length > this.allbugs.length){
      let path = paths.pop();
      //this.win.removeChild(path);
      path.parentNode.removeChild(path);
    }
    while (paths.length < this.allbugs.length){
      let path = document.createElementNS('http://www.w3.org/2000/svg',"g");
      paths.push(path);
      this.win.appendChild(path);
    }
    
    let universe = {
      height: this.ysize,
      width: this.xsize,
    };
    this.allbugs
      .map(function(b){
        return {
            'isPrey': b.isPrey,
            'hist':b.hist,
          };
      })
      .forEach(function(b,i){
        let last = b.hist[0];
        let path = paths[i];
        let lines = Array.from(path.querySelectorAll('path'));
        let line = null;
        while (lines.length < b.hist.length){
          line = document.createElementNS('http://www.w3.org/2000/svg',"path");
          line.setAttribute('fill','none');
          line.setAttribute('stroke-width',2);
          lines.push(line);
          path.appendChild(line);
        }
        while (lines.length > b.hist.length){
          line = lines.pop();
          line.parentNode.removeChild(line);
        }
        
        b.hist
          .forEach(function(seg,i){
            let colour = colours[i%colours.length];
            if(b.isPrey){
              colour = new RGB(255,255,255,1);
            }
            line = lines[i];
            line.setAttribute('d',[
                "M",
                Math.floor(universe.height * last[0]),
                ",",
                Math.floor(universe.width * last[1]),
                "L",
                Math.floor(universe.height * seg[0]),
                ",",
                Math.floor(universe.width * seg[1]),
              ].join(' '));
            line.setAttribute('stroke',colour.HtmlCode);
            line.setAttribute('opacity',colour.opacity);
            last = seg;
          })
          ;
      })
      ;
  }
  
  
  
  /**
   * initBugs
   *
   */
  initBugs(){
    //*** Test Values ***
    //*
    //this.nbugs = 2
    //this.ntargets = 1
    //this.trailLen = 20
    //*
    //*** Test Values ***
    
    let ntargets = 1 + (Math.random() * 0.75 + 0.25) * (this.MAX_TARGETS-1);
    ntargets = Math.floor(ntargets);
    if (ntargets > this.MAX_TARGETS) { ntargets = this.MAX_TARGETS}
    
    let nbugs = 1 + (Math.random() * 0.75 + 0.25) * (this.MAX_BUGS-1);
    nbugs = Math.floor(nbugs);
    if (nbugs > this.MAX_BUGS) { nbugs = this.MAX_BUGS}
    
    this.allbugs = [];
    for(let i=ntargets+nbugs; i>=0; i--){
      let b = new sBug(this);
      this.allbugs.push(b);
    }
    this.bugs = this.allbugs.slice(0,nbugs);
    this.targets = this.allbugs.slice(nbugs);
    
    this.pickNewTargets();
  }
  
  
  
  /**
   * initColourMap
   * 
   */
  initColourMap(){
    //this.trailLen = (1 - (Math.random() * 0.6) * Math.random()) * MAX_TRAIL_LEN
    this.trailLen = this.Params.trailLen.val;
    this.trailLen = Math.floor(this.trailLen);
    if (this.trailLen > this.MAX_TRAIL_LEN) { 
      this.trailLen = this.MAX_TRAIL_LEN; 
    }
    
    
    this.trails = {
        gray : [],
        red : [],
        green : [],
        blue : [],
        graySchizo : [],
        redSchizo : [],
        greenSchizo : [],
        blueSchizo : [],
        
        random : [],
      };
    
    // get all the keys except 'random' we will use them to 
    // generate the random value
    let nonrand = Object
      .keys(this.trails)
      .filter(function(d){
        return d !== "random";
      });
    
    for(let i = this.trailLen; i >= 0; i--){
      let opacity = i/this.trailLen;
      this.trails.gray .push(new RGB(255, 255, 255, opacity));
      this.trails.red  .push(new RGB(255,   0,   0, opacity));
      this.trails.green.push(new RGB(  0, 255,   0, opacity));
      this.trails.blue .push(new RGB(  0,   0, 255, opacity));
      
      this.trails.graySchizo .push(new RGB(255, 255, 255, Math.random()));
      this.trails.redSchizo  .push(new RGB(255,   0,   0, Math.random()));
      this.trails.greenSchizo.push(new RGB(  0, 255,   0, Math.random()));
      this.trails.blueSchizo .push(new RGB(  0,   0, 255, Math.random()));
      
      // select one of the previous items at random
      // this will tend to favour the the earlier created ones
      // that is on purpose so that the opacity stays brighter
      let rand = Math.floor(nonrand.length * Math.random());
      rand = nonrand[rand];
      rand = this.trails[rand];
      rand = rand[Math.floor(rand.length * Math.random())];
      rand = JSON.clone(rand);
      this.trails.random.push(rand);
    }
  }
  
  
  
  /**
   * initGraphics
   *
   */
  initGraphics(){
    this.initColourMap();
    
    
    this.xsize = this.win.clientWidth;
    this.ysize = this.win.clientHeight;
    
    this.xc = this.xsize / 2;
    this.yc = this.ysize / 2;
    
    this.colorScheme = this.RandomColorScheme;
    
    return true;
  }
  
  get RandomColorScheme(){
    let trails = Object.keys(this.trails);
    trails = trails[Math.floor(trails.length * Math.random())];
    return trails;
  }
  
  
  
  /**
   * mutateBug
   * 
   * Mutation is the act of a predator becoming prey, or prey becoming 
   * a predator.
   */
  mutateBug(which){
    if (which % 2 === 0) {
      /* turn bug into target */
      // don't do it if we have too many targets, or not enough bugs
      if (this.targets.length < this.MAX_TARGETS-1 && this.bugs.length > this.targets.length) {
        // select a bug at random and pull it out of its list
        let i = Math.floor(Math.random * this.bugs.length);
        let b = this.bugs.splice(i,1).pop();
        this.targets.push(b);
        // make it a target
        b.closest = null;
        
        // grab a bunch of bugs and point them
        // at the new target
        let inc = Math.floor(this.bugs.length / this.targets.length);
        for(i = 0; i<this.bugs.length; i += inc){
          this.bugs[i].closest = b;
        }
      }
    }
    else{
      /* turn target into bug */
      if (this.targets.length > 2 && this.bugs.length < this.MAX_BUGS-1) {
        /* pick a target */
        let i = Math.floor(Math.random() * this.targets.length);
        
        /* copy state into a new bug */
        let b = this.targets.splice(i,1).pop();
        this.bugs.push(b);
        
        /* pick a target for the new bug */
        b.closest = this.targets[0];
      }
    }
  }
  
  
  
  /**
   * mutateParam
   * 
   * Modifies a parameter by a random, incremental amount. This means that it
   * changes by a random amount, but no more than 25% either way. For example,
   * if the value was 100 it could } // up being any value between 75 and 125.
   */
  mutateParam(Param){
    this.mutateRate = 0.25;
    this[Param] *= (1 - this.mutateRate + Math.random() * this.mutateRate * 2);
  }
  
  
  
  /**
   * pickNewTargets
   * 
   * This cycles through all of the bugs and sets them to a new, random,
   * target.
   */
  pickNewTargets(){
    let targets = this.targets;
    this.bugs.forEach(function(b,i){
      let targ = b.swarm.targets.length;
      targ *= Math.random();
      targ = Math.floor(targ);
      b.closest = targets[targ];
    });
    

  }
  
  
  
  /**
   * randomSmallChange
   *
   */
  randomSmallChange(){
    if (this.callDepth > 10) return;
    this.callDepth = (this.callDepth || 0) + 1;
    
    let that = this;
    let changes = [
        /* acceleration */
        function(){ that.mutateParam('maxAcc'); },
        /* target acceleration */
        function(){ that.mutateParam('targetAcc'); },
        /* velocity */
        function(){ that.mutateParam('maxVel'); },
        /* target velocity */
        function(){ that.mutateParam('targetVel'); },
        /* noise */
        function(){ that.mutateParam('noise'); },
        /* minVelMultiplier */
        function(){ that.mutateParam('minVelMultiplier'); },
        /* target to bug */
        function(){ that.mutateBug(1); },
        /* target to bug */
        function(){that.mutateBug(1); },
        /* bug to target */
        function(){ that.mutateBug(0); },
        /* bug to target */
        function(){ that.mutateBug(0); },
        /* color scheme */
        function(){ that.colorScheme = that.RandomColorScheme; },
        /* default */
        function(){
          that.randomSmallChange();
          that.randomSmallChange();
          that.randomSmallChange();
          that.randomSmallChange();
        }
      ];
    let change = changes[Math.floor(Math.random() * changes.length)];
    change();
    
    if (this.minVelMultiplier < 0.3) {
      this.minVelMultiplier = 0.3;
    } // if
    if (this.minVelMultiplier > 0.9) {
      this.minVelMultiplier = 0.9;
    } // if
    if (this.noise < 0.01) { this.noise = 0.01;}
    if (this.maxVel < 0.02) { this.maxVel = 0.02;}
    if (this.targetVel < 0.02) { this.targetVel = 0.02;}
    if (this.targetAcc > this.targetVel * 0.7) { this.targetAcc = this.targetVel * 0.7;}
    if (this.maxAcc > this.maxVel * 0.7) { this.maxAcc = this.maxVel * 0.7;}
    if (this.targetAcc > this.targetVel * 0.7) { this.targetAcc = this.targetVel * 0.7;}
    if (this.maxAcc < 0.01) { this.maxAcc = 0.01;}
    if (this.targetAcc < 0.005) { this.targetAcc = 0.005;}
    
    this.computeConstants();
    
    this.callDepth = this.callDepth - 1;
    
  }
  
  
  
  /**
   * randomBigChange
   *
   */
  randomBigChange(){
    if (this.callDepth > 3) return;
    this.callDepth = this.callDepth + 1;
    
    let whichcase = 0;
    let temp = 0;
    
    whichcase = Math.floor(Math.random() * 4);
    
    switch(whichcase){
      case 0:
        ///* trail length */
        temp = (Math.random() * (this.MAX_TRAIL_LEN - 25)) + 25;
        this.clearBugs();
        this.trailLen = temp;
        this.initColourMap();
        this.initBugs();
        break;
      case 1:
        /* Whee! */
        this.randomSmallChange();
        this.randomSmallChange();
        this.randomSmallChange();
        this.randomSmallChange();
        this.randomSmallChange();
        this.randomSmallChange();
        this.randomSmallChange();
        this.randomSmallChange();
        break;
      case 2:
        this.clearBugs();
        this.initBugs();
        break;
      case 3:
        this.pickNewTargets();
        break;
      default:
        temp = Math.random() * this.targets.length ;
        this.targets[temp].pos[0] = this.targets[temp].pos[0] + ((Math.random() * this.maxx / 4) - this.maxx / 8);
        this.targets[temp].pos[1] = this.targets[temp].pos[1] + ((Math.random() * this.maxy / 4) - this.maxy / 8);
        ///* updateState() will fix bounds */
        //updateState //will fix bounds
    }
    
    this.callDepth--;
  }
  
  
  /**
   * screenhack
   *
   */
  screenhack(w /* as window */){
    
    this.initVar();
    
    if (w === null) {
      throw new Error("No Form received to draw on.");
    }
    this.win = null;
    this.win = w;
    
    if (!this.initGraphics()) {
      return;
    }
    
    this.computeConstants();
    this.initBugs();
    this.initColourMap();
    
    
    if (this.changeProb > 0) {
      for(let i = (Math.random() * 5) + 5 ; i >= 0; i--){
        this.randomSmallChange();
      }
    }
    
    
    let eng = this;
    this.timer = setInterval(function(){eng.processFrame()},this.msPerFrame);
  }
  
  
  
  /**
   * ProcessFrame
   */
  processFrame(){
    if(!this.Continue){
      clearInterval(this.timer);
      this.timer = null;
    }
    
    
    let sTime = Date.now();
    this.updateState();
    this.drawBugs(this.colorScheme);
    
    let change = Math.random();
    if (change < this.changeProb * 0.1) {
      this.randomBigChange();
    }
    else if (change < this.changeProb) {
      this.randomSmallChange();
    }
      
    let eTime = Date.now();
    let elapsed = eTime - sTime;
    //console.log(['Time:',sTime,eTime,elapsed].join('\n - '));
    if (elapsed > this.msPerFrame/2) {
      // need to speed things up somehow
      // Obviously we are taking to long to do the processing. Somehow 
      // we need to reduce the processing time. A couple of suggestions are
      // explored below: too many bugs, delay time can be made a little 
      // longer, we can make the bugs shorter in length
      if (this.bugs.length > 10) { //always evaluate to false?
        console.log("Reducing bugs to improve speed.\n");
        let numBugs = Math.floor((this.msPerFrame/elapsed) * this.bugs.length);
        if(numBugs < 10) {
          numBugs = 10;
        }
        while(numBugs < this.bugs.length) {
          let b = this.bugs.pop();
          b = this.allbugs.indexOf(b);
          this.allbugs.splice(b,1);
        }
        
        while (this.targets.length >= this.bugs.length / 2) {
          this.mutateBug(1);
        }
        this.clearBugs();
      }
      else if (this.dt < 0.3) {
        //debug.Print "increasing dt to improve speed."
        this.dt = this.dt * this.MIN_FPS / this.fps;
        this.computeConstants();
      }
      else if (this.trailLen > 10) {
        this.clearBugs();
        this.trailLen = this.trailLen * (this.fps / this.MIN_FPS);
        if (this.trailLen < 10) {
          this.trailLen = 10;
        }
        this.initBugs();
      }
      
    }
    
  }
  
  
  
  /** 
   * updateState
   *
   */
  updateState(){
    this.bugs.forEach(function(bug,j){
        bug.spotNewPrey(bug.swarm.targets);
      });
    
    /* update target state */
    this.allbugs.forEach(function(b){
      b.updateDirection();
    });
    
  }
  
  
  
  /** 
   * CreateParams
   *
   */
  CreateParams(){
      this.Params = {};
      this.Params["cls"] = {type:'INT',min:0,max:1,val:1};
      this.Params["fps"] = {type:'FLT',min:16,max:150,val:150};
      this.Params["trailLen"] = {type:'INT', min:5, max:60, val:40};
      this.Params["Bugs"]={type:'INT',min: 2,max: 100,val: 50};
      this.Params["Targets"]={type:'INT', min:2, max:5, val:5};
      this.Params["vel"]={type:'FLT', min:0, max:1, val:0.03};
  }
}
