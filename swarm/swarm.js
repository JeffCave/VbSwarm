/******************************************************************************
 * This code Modified from its original C source by Jeff Cave (k@vius.ca)
 *
 * Included below is the original Copyright notice and licencing. I'm not a
 * lawyer. So I am not going to even try to apply changes to it. The copyright
 * notice below is the copyright on the code associated with this document.
 *
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

/* global sBug, global miscMath, global bugParams, global RGB */

class Swarm{
  
  
  constructor(canvas){
    this.GRAY_TRAILS = 0;
    this.COLOR_TRAILS = 1;
    this.RANDOM_TRAILS = 2;
    this.GRAY_SCHIZO = 3;
    this.RANDOM_SCHIZO = 4;
    this.COLOR_SCHIZO = 5;
    this.NUM_SCHEMES = 3;
    
    this.grayIndex = [];
    this.redIndex= []; // as Long
    this.blueIndex= []; // as Long
    this.graySIndex= []; // as Long
    this.redSIndex= []; // as Long
    this.blueSIndex= []; // as Long
    this.randomIndex= []; // as Long
    
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
      .from(this.win.querySelectorAll('path'))
      .forEach(function(path){
        path.parentNode.removeChild(path);
      });
  }
  
  
  
  /**
   * computeConstants
   *
   */
  computeConstants(){
    this.halfDtSq = miscMath.sq(this.dt) * 0.5;
    this.dtInv = 1 / this.dt;
    this.targetVelSq = miscMath.sq(this.targetVel);
    this.maxVelSq = miscMath.sq(this.maxVel);
    this.minVel = this.maxVel * this.minVelMultiplier;
    this.minVelSq = miscMath.sq(this.minVel);
  }
  
  
  
  /**
   * drawBugs
   *
   */
  drawBugs(scheme){
    let colours = this.trails[scheme];
    let colour = colours[0].HtmlCode;
    
    let paths = Array.from(this.win.querySelectorAll('path'));
    while (paths.length > this.allbugs.length){
      let path = paths.pop();
      this.win.removeChild(path);
    }
    while (paths.length < this.allbugs.length){
      let path = document.createElementNS('http://www.w3.org/2000/svg',"path");
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
      .map(function(b){
        let path = "M " + b.hist
          //.filter(function(seg){
          //  return !(seg[0] === null || seg[1] === null);
          //})
          .map(function(seg){
            seg = [
                Math.floor(universe.height * seg[0]),
                Math.floor(universe.width * seg[1])
              ];
            seg = seg.join(',');
            return seg;
          })
          .join(' L ')
          ;
        return {
            path:path,
            isPrey:b.isPrey,
          };
      })
      .forEach(function(b,i) {
        let path = paths[i];
        path.setAttribute('d',b.path);
        path.setAttribute('stroke',b.isPrey?'#FFFFFF':colour);
        path.setAttribute('fill','none');
        path.setAttribute('stroke-linecap',"round");
      });
      
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
    //this.trailLen = (1 - Math.rand(0.6) * Math.rand(1)) * MAX_TRAIL_LEN
    this.trailLen = this.Params.trailLen.val;
    this.trailLen = Math.floor(this.trailLen);
    if (this.trailLen > this.MAX_TRAIL_LEN) { this.trailLen = this.MAX_TRAIL_LEN}
    

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
      
      let red   = this.trails.red  [Math.floor(this.trails.red  .length * Math.random())].opacity;
      let green = this.trails.green[Math.floor(this.trails.green.length * Math.random())].opacity;
      let blue  = this.trails.blue [Math.floor(this.trails.blue .length * Math.random())].opacity;
      this.trails.random.push(new RGB(red * 256, green * 256, blue * 256));
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
    if (which % 2) {
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
    this[Param] *= (1 - this.mutateRate + Math.rand(this.mutateRate * 2));
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
        temp = Math.rand(this.ntargets - 1);
        this.targets[temp].pos[0] = this.targets[temp].pos[0] + (Math.rand(this.maxx / 4) - this.maxx / 8);
        this.targets[temp].pos[1] = this.targets[temp].pos[1] + (Math.rand(this.maxy / 4) - this.maxy / 8);
        ///* updateState() will fix bounds */
        //updateState //will fix bounds
    }
    
    this.callDepth = this.callDepth - 1;
  }
  
  
  /**
   * screenhack
   *
   */
  screenhack(w /* as window */){
    
    this.initVar();
    
    if (w == null) {
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
    if (change < this.changeProb * 0.3) {
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
      // based on the x/y coordinates of the bug, and it's closest target, use
      // pythagorean theorum to determine its distance
      let x = bug.closest.pos[0] - bug.pos[0];
      let y = bug.closest.pos[1] - bug.pos[1];
      let dist = miscMath.sq(x) + miscMath.sq(y);
      bug.swarm.targets.forEach(function(targ,i){
        // if this is already the one marked closest, there is nothing to check
        if (targ === bug.closest) return;
        
        // if this item is closer than the one we think is closest, mark this
        // one as the closest
        let x = targ.pos[0] - bug.pos[0];
        let y = targ.pos[1] - bug.pos[1];
        let newDist = miscMath.sq(x) + miscMath.sq(y);
        
        // our creature does not want to give up the chase, it will stay 
        // focussed on its prey. However if another prey animal is *really* 
        // close (say half the distance) it breaks off its current chase and 
        // goes for the one even closer
        if (newDist * 2 < dist) {
          bug.closest = targ;
          dist = newDist;
        }
        
      });
    });
    
    /* update target state */
    this.allbugs.forEach(function(b,i){
      let newVel = 0;
      let velSq = 0;
      let maxVel = 0;
      let acc = 0;
      if(b.isPrey){
        velSq = b.swarm.targetVelSq;
        maxVel = b.swarm.targetVel;
        acc = b.swarm.targetAcc;
        newVel = Math.rand(Math.PI * 2);
      }
      else{
        velSq = b.swarm.maxVelSq;
        maxVel = b.swarm.maxVel;
        acc = b.swarm.maxAcc;
        newVel = Math.atan(
              b.closest.pos[1] - b.pos[1] + Math.rand(b.swarm.noise) - (b.swarm.noise / 2)
            , b.closest.pos[0] - b.pos[0] + Math.rand(b.swarm.noise) - (b.swarm.noise / 2)
          );
      }
      let x = acc * Math.cos(newVel);
      let y = acc * Math.sin(newVel);
      
      b.vel[0] += x * b.swarm.dt;
      b.vel[1] += y * b.swarm.dt;
      
      /* check velocity */
      newVel = miscMath.sq(b.vel[0]) + miscMath.sq(b.vel[1]);
      if (newVel > velSq) {
        newVel = maxVel / miscMath.sqrt(newVel);
        /* save old vel for acc computation */
        x = b.vel[0];
        y = b.vel[1];
        
        /* compute new velocity */
        b.vel[0] *= newVel;
        b.vel[1] *= newVel;
        
        /* update acceleration */
        x = (b.vel[0] - x) * b.swarm.dtInv;
        y = (b.vel[1] - y) * b.swarm.dtInv;
      }
      
      /* update position */
      b.pos[0] += (b.vel[0] * b.swarm.dt + x * b.swarm.halfDtSq);
      b.pos[1] += (b.vel[1] * b.swarm.dt + y * b.swarm.halfDtSq);
      
      // prey is not allowed to leave the game board
      if(b.isPrey){
        /* check limits on targets */
        if (b.pos[0] < 0 || b.pos[0] >= b.swarm.xsize) {
          /* bounce */
          b.vel[0] *= -1;
        }
        if (b.pos[1] < 0 || b.pos[1] >= b.swarm.ysize) {
          /* bounce */
          b.vel[1] *= -1;
        }
      }
      
      b.hist.unshift(JSON.clone(b.pos));
      if(b.hist.length > b.swarm.trailLen) {
        b.hist.pop();
      }
    });
    
  }
  
  
  
  /** 
   * CreateParams
   *
   */
  CreateParams(){
      this.Params = {};
      this.Params["cls"] = {type:'int',min:0,max:1,val:1};
      this.Params["fps"] = {type:'FLT',min:16,max:150,val:150};
      this.Params["trailLen"] = {type:'INT', min:5, max:60, val:40};
      this.Params["Bugs"]={type:'INT',min: 2,max: 100,val: 50};
      this.Params["Targets"]={type:'INT', min:2, max:5, val:5};
      this.Params["vel"]={type:'FLT', min:0, max:1, val:0.03};
  }
}
