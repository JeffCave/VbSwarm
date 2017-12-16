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
    this.colors = Array(256).fill(0);
    
    this.win = canvas; 
    
    this.xsize = null; // = 0;
    this.ysize = null; // = 0;
    this.xc = null; // = 0;
    this.yc = null; // = 0;
    this.delay = null; // = 0;
    this.maxx = null; // = 0.0;
    this.maxy = null; // = 0.0;
    
    this.nbugs = 0;
    this.ntargets = 0;
    this.ntotbugs = 0;
    this.trailLen = 0;
    
    /* vars dependent on those above */
    this.dtInv = 0.0;
    this.halfDtSq = 0.0;
    this.maxVelSq = 0.0;
    this.targetVelSq = 0.0;
    this.minVelSq = 0.0;
    this.minVel = 0.0;
    
    this.GRAY_TRAILS = 0;
    this.COLOR_TRAILS = 1;
    this.RANDOM_TRAILS = 2;
    this.GRAY_SCHIZO = 3;
    this.RANDOM_SCHIZO = 4;
    this.COLOR_SCHIZO = 5;
    this.NUM_SCHEMES = 3;
    
    this.bugs = []; // As bug
    this.targets = []; // As bug
    this.allbugs = []; // As bug
    this.head = 0;
    this.tail = 0;
    this.colorScheme = 0;
    this.changeProb = 0.0;
    
    this.grayIndex = [];
    this.redIndex= []; // as Long
    this.blueIndex= []; // as Long
    this.graySIndex= []; // as Long
    this.redSIndex= []; // as Long
    this.blueSIndex= []; // as Long
    this.randomIndex= []; // as Long
    this.numColors = 0;
    this.numRandomColors = 0;
    
    this.good1 = bugParams;
    
    this.dt               = 0.0;
    this.targetVel        = 0.0;
    this.targetAcc        = 0.0;
    this.maxVel           = 0.0;
    this.maxAcc           = 0.0;
    this.noise            = 0.0;
    this.minVelMultiplier = 0.0;
    
    this.callDepth = 0;
    
    
    this.good1 = bugParams;
    this.Continue = true;
    
    this.CreateParams();
    this.initVar();
  }
  
  
  
  /*** initVar ****************************************************************
   * In the 'C' version, there are a lot of variables that are initialized at
   * the same time that they are declared. Since this is not possible in VB, 
   * we call initVar to initialize them when the class is created.
   ***************************************************************************/
  initVar(){
    this.good1.trailLen = this.Params.trailLen;
    
    this.goodParams = [];
    this.goodParams.push(this.good1);
    
    this.head = 0;
    this.tail = 0;
    this.colorScheme = -1;
    this.changeProb = 0.08;
    
    this.dt = this.good1.dt;
    this.targetVel = this.good1.targetVel;
    this.targetAcc = this.good1.targetAcc;
    this.maxVel = this.good1.maxVel;
    this.maxAcc = this.good1.maxAcc;
    this.noise = this.good1.noise;
    this.minVelMultiplier = 0.5;
    
    this.grayIndex = Array(this.MAX_TRAIL_LEN).fill(0);
    this.redIndex = Array(this.MAX_TRAIL_LEN).fill(0);
    this.blueIndex = Array(this.MAX_TRAIL_LEN).fill(0);
    this.graySIndex = Array(this.MAX_TRAIL_LEN).fill(0);
    this.redSIndex = Array(this.MAX_TRAIL_LEN).fill(0);
    this.blueSIndex = Array(this.MAX_TRAIL_LEN).fill(0);
    this.randomIndex = Array(this.MAX_TRAIL_LEN).fill(0);
    
    this.nbugs = -1;
    this.ntargets = -1;
    this.trailLen = -1;
  }
  
  
  
  /*** get MAX_TRAIL_LEN ******************************************************
   *
   ***************************************************************************/
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
  
  
  /*** clearBugs **************************************************************
   * Clear the screen of bugs
   ***************************************************************************/
  clearBugs(){
      let j = 0;
      let temp = 0;
      
      this.tail -= 1;
      if (this.tail < 0) {
        this.tail = this.this.trailLen - 1;
      } // if
      
      if ((this.head + 1) % (this.trailLen - 1) == this.tail) {
        this.temp = (this.tail + 1) % this.this.trailLen;
        
        this.allbugs.forEach((b)=>{
          this.win.Line (b.hist[this.tail][ 0], b.hist(this.tail, 1))-(b.hist(temp, 0), b.hist(temp, 1));
        });
        
        temp = (this.tail + 1) % (this.trailLen - 1);
      } // if
      
      j = this.tail;
      while (j !== this.head){
        temp = (j + 1) % (this.trailLen);
        
        this.win.ForeColor = 0;
        this.allbugs.forEach((b)=>{
            this.win.Line (b.hist[j][0], b.hist[j][1])-(b.hist[temp][0], b.hist[temp][1]);
        });
        
        j = temp;
      }
  }
  /*** clearBugs *************************************************************/
  
  
  
  /*** computeConstants *******************************************************
   *
   ***************************************************************************/
  computeConstants(){
    this.halfDtSq = miscMath.sq(this.dt) * 0.5;
    this.dtInv = 1 / this.dt;
    this.targetVelSq = miscMath.sq(this.targetVel);
    this.maxVelSq = miscMath.sq(this.maxVel);
    this.minVel = this.maxVel * this.minVelMultiplier;
    this.minVelSq = miscMath.sq(this.minVel);
  } 
  
  
  /*** computeColorIndices **************************************************
   *
   *************************************************************************/
  computeColorIndices(){
    let i = 0;
    
    /* note: colors are used in *reverse* order! */
    //let redSchizoLength = this.trailLen / 4;
    let blueSchizoLength = this.trailLen / 2;
    
    for(i = this.trailLen - 1; i >= 0; i--){
      let schizo = Math.floor((i * 16 / this.trailLen) + 0.5);
      //grayscale
      this.grayIndex[i] = 4 + i;
      if (this.grayIndex[i] > 19) { this.grayIndex[i] = 19; }
      //red
      this.redIndex[i] = 20 + schizo;
      if (this.redIndex[i] > 35) { this.redIndex[i] = 35}
      //blue
      this.blueIndex[i] = 36 + schizo;
      if (this.blueIndex[i] > 51) { this.blueIndex[i] = 51}
      //grayschizo
      this.graySIndex[i] = 4 + schizo;
      //red schizo
      this.redSIndex[i] = 20 + schizo;
      if (this.redSIndex[i] > 35) { this.redSIndex[i] = 35}
      //blue schizo
      this.blueSIndex[i] = 36 + 16 * ((this.trailLen - 1 - i) % blueSchizoLength) / (blueSchizoLength - 1) + 0.5;
      if (this.blueSIndex[i] > 51) { this.blueSIndex[i] = 51; }
      //random
      this.randomIndex[i] = 52 + Math.random() * this.numRandomColors;
      //debug.Print i
    }
  } // Sub
  /*** computeColorIndices *************************************************/
  
  
  
  /*** drawBugs *************************************************************
   *
   *************************************************************************/
  drawBugs(tColorIdx, tci0, tnc, colorIdx, ci0, nc){
    let i = 0;
    let j = 0;
    let temp = 0;
    let colour = 0;
    
    if ((this.head + 1) % (this.trailLen) === this.tail) {
      /* first, erase last segment of bugs if necessary */
      temp = (this.tail + 1) % (this.trailLen);
      
      let ctx = this.win.getContext("2d");
      colour = new RGB(0,0,0);
      ctx.strokeStyle = colour.HtmlColor;
      this.allbugs.forEach(function(b){
        let tl = b.hist[this.tail];
        let br = b.hist[temp];
        ctx.moveTo( tl[0], tl[1] );
        ctx.lineTo( br[0], br[1] );
        ctx.stroke();
      });
      
      this.tail = (this.tail + 1) % this.trailLen;
    }
    
    j = this.tail;
    while (j != this.head){
      temp = (j + 1) % (this.trailLen);
      
      colour = this.colors[this.colorIdx[nc - ci0]];
      let ctx = this.win.getContext("2d");
      ctx.strokeStyle = colour.HtmlColor;
      this.allbugs.forEach(function(b) {
        let tl = b.hist[j];
        let br = b.hist[temp];
        ctx.moveTo( tl[0] , tl[1] );
        ctx.lineTo( br[0] , br[1] );
        ctx.stroke();
      });
      
      ci0 = (ci0 + 1) % nc;
      tci0 = (tci0 + 1) % tnc;
      
      j = temp;
      
    }
  }
  /*** drawBugs ************************************************************/
  
  
  
  /*** initBugs ********************************************************
   *
   ********************************************************************/
  initBugs(){
    let i = 0;
    
    this.head = 0;
    this.tail = 0;
    
    //*** Test Values ***
    //*
    //this.nbugs = 2
    //this.ntargets = 1
    //this.trailLen = 20
    //*
    //*** Test Values ***
    
    if (this.ntargets < 0) {
      this.ntargets = (0.25 + miscMath.fRand(0.75) * miscMath.fRand(1)) * (this.MAX_TARGETS - 1) + 1;
      this.ntargets = Math.floor(this.ntargets);
    }
    if (this.nbugs < 0) {
      this.nbugs = (0.25 + miscMath.fRand(0.75) * miscMath.fRand(1)) * (this.MAX_BUGS - 1) + 1;
      this.nbugs = Math.floor(this.nbugs);
    }
    if (this.trailLen < 0) {
      //this.trailLen = (1 - miscMath.fRand(0.6) * miscMath.fRand(1)) * MAX_TRAIL_LEN
      this.trailLen = this.Params.trailLen.val;
      this.trailLen = Math.floor(this.trailLen);
    }
    
    if (this.nbugs > this.MAX_BUGS) { this.nbugs = this.MAX_BUGS}
    if (this.ntargets > this.MAX_TARGETS) { this.ntargets = this.MAX_TARGETS}
    if (this.trailLen > this.MAX_TRAIL_LEN) { this.trailLen = this.MAX_TRAIL_LEN}
    
    this.ntotbugs = this.ntargets + this.nbugs;
    
    this.allbugs = [];
    this.bugs = [];
    this.targets = [];
    for(i = 0; i<this.ntotbugs; i++){
      let b = new sBug(this);
      this.allbugs.push(b);
    }
    this.bugs = this.allbugs.slice(0,this.nbugs);
    this.targets = this.allbugs.slice(this.nbugs);
    
    let targets = this.targets;
    this.bugs.forEach(function(b,i){
      let targ = b.swarm.targets.length - 1;
      targ *= Math.random();
      targ = Math.floor(targ);
      b.closest = targets[targ];
    });
    
  }
  /*** initBugs *******************************************************/
  
  
  
  /*** InitCMap ********************************************************
   * 
   ********************************************************************/
  initCMap(){
    let i = 0;
    let n = 0;
    let temp = 0;
    
    /* color 0 is black */
    this.colors[n] = new RGB(0, 0, 0); n++;
    
    /* color 1 is red */
    this.colors[n] = new RGB(255, 0, 0); n++;
    
    /* color 2 is green */
    this.colors[n] = new RGB(0, 255, 0); n++;
    
    /* color 3 is blue */
    this.colors[n] = new RGB(0, 0, 255); n++;
    
    /* start greyscale colors at 4; 16 levels */
    for( i = 0; i< 16; i++){
      temp = i * 16;
      if (temp > 255) {
        temp = 255;
      } // if
      temp = 255 - temp;
      this.colors[n] = new RGB(temp, temp, temp); n++;
    }
    
    /* start red fade at 20; 16 levels */
    for(i = 0; i < 16; i++){
      temp = i * 16;
      if (temp > 255) {
        temp = 255;
      } // if
      this.colors[n] = new RGB(255 - temp, 255 - ((i / 16 + 0.001) ^ 0.3) * 255, this.colors[n] = 65 - temp / 4);
      n++;
    }
    
    /* start blue fade at 36; 16 levels */
    for(i = 0; i < 16; i++){
      temp = i * 16;
      if (temp > 255) {
        temp = 255;
      } // if
      this.colors[n] = new RGB(miscMath.WrapByte(32 - temp), miscMath.WrapByte(180 - ((i / 16 + 0.001) ^ 0.3) * 180), miscMath.WrapByte(255 - temp));
      n = n + 1;
    }
    
    /* random colors start at 52 */
    this.numRandomColors = this.MAX_TRAIL_LEN;
    
    this.colors[n] = new RGB(miscMath.WrapByte(Math.random() * 255), miscMath.WrapByte(miscMath.fRand() & 255), miscMath.WrapByte(this.colors[n - 2] / 2 + this.colors[n - 3] / 2));
    n = n + 1;
    
    for(i = 0; i < this.numRandomColors; i++){
      this.colors[n] = new RGB(miscMath.WrapByte((this.colors[n-3] + (miscMath.fRand() & 31) - 16) & 255), miscMath.WrapByte((this.colors[n-3] + (miscMath.fRand & 31) - 16) & 255), this.colors[n] == miscMath.WrapByte(this.colors[n-2] / (i + 2) + this.colors[n-3] / (i + 2)));
      n = n + 1;
    }
    
    this.numColors = n;
    
  }

  
  
  /**
   * initGraphics
   *
   */
  initGraphics(){
    this.initCMap();
    
    this.xsize = this.win.width;
    this.ysize = this.win.height;
    
    this.xc = this.xsize / 2;
    this.yc = this.ysize / 2;
    
    this.maxx = 1;
    this.maxy = this.ysize / this.xsize;
    
    if (this.colorScheme < 0) {
      this.colorScheme = Math.floor(miscMath.fRand(this.NUM_SCHEMES - 1));
    }
    
    return true;
  } // Function
  /*** initGraphics ***************************************************/
  
  
  
  /*** mutateBug *******************************************************
   * Mutation is the act of a predator becoming prey, or prey becoming 
   * a predator.
   ********************************************************************/
  mutateBug(which){
    if (which == 0) {
      /* turn bug into target */
      if (this.ntargets < this.MAX_TARGETS - 1 && this.nbugs > this.ntargets) {
        let i = miscMath.fRand(this.nbugs - 1);
        this.targets[this.ntargets] = this.bugs[i];
        this.bugs[i] = this.bugs[this.nbugs-1];
        this.targets[this.ntargets].closest = null;
        this.nbugs--;
        this.ntargets--;
        
        for(i = 0; i < Math.floor(this.nbugs / this.ntargets); i++){
          //debug.Print (i % nbugs)
          this.bugs[i%this.nbugs].closest = this.targets[this.ntargets-1];
        }
      }
    }
    else{
      /* turn target into bug */
      if (this.ntargets > 2 && this.nbugs < this.MAX_BUGS - 1) {
        /* pick a target */
        let i = Math.random() * (this.ntargets - 1);
        
        /* copy state into a new bug */
        this.bugs[this.nbugs] = this.targets[i];
        this.targets[i] = this.targets[this.ntargets-1];
        this.targets[this.ntargets-1] = null;
        this.ntargets = this.ntargets - 1;
        this.nbugs = this.nbugs + 1;
        
        /* pick a target for the new bug */
        this.bugs[this.nbugs-1].closest = this.targets[Math.floor(Math.random() * (this.ntargets - 1))];
        
        for(let j = 0; j < this.nbugs; j++){
          if (this.bugs[j].closest == this.bugs[this.nbugs-1]) {
            this.bugs[j].closest = this.targets[Math.random() * (this.ntargets - 1)];
          }
        }
        
      }
    }
  }
  /*** mutateBug ******************************************************/
  
  
  
  /**** mutateParam ***************************************************
   * Modifies a parameter by a random, incremental amount. This means that it
   * changes by a random amount, but no more than 25% either way. For example,
   * if the value was 100 it could } // up being any value between 75 and 125.
   *******************************************************************/
  mutateParam(Param){
    this.mutateRate = 0.25;
    this.Param = this.Param * (1 - this.mutateRate + miscMath.fRand(this.mutateRate * 2));
  }
  /*** mutateParam **************************************************/
  
  
  
  /*** pickNewTargets *********************************************************
   * This cycles through all of the bugs and sets them to a new, random,
   * target. Currently this is favouring one bug.
   ***************************************************************************/
  pickNewTargets(){
    for(let i = 0; i < this.nbugs; i++){
      //Set bugs(i).closest = targets(miscMath.fRand(ntargets - 1))
      this.bugs[i].closest = this.targets[i % this.ntargets];
    }
  }
  /*** pickNewTargets ********************************************************/
  
  
  
  /*** randomSmallChange ******************************************************
   *
   ***************************************************************************/
  randomSmallChange(){
    if (this.callDepth > 10) return;
    this.callDepth = (this.callDepth || 0) + 1;
    
    let whichcase = Math.random() * 11;
    switch(whichcase){
      case 0:    /* acceleration */
        this.mutateParam(this.maxAcc);
        break;
      case 1:    /* target acceleration */
        this.mutateParam(this.targetAcc);
        break;
      case 2:    /* velocity */
        this.mutateParam(this.maxVel);
        break;
      case 3:    /* target velocity */
        this.mutateParam(this.targetVel);
        break;
      case 4:    ///* noise */
        this.mutateParam(this.noise);
        break;
      case 5:    ///* minVelMultiplier */
        this.mutateParam(this.minVelMultiplier);
        break;
      case 6:    /* target to bug */
        this.mutateBug(1);
        break;
      case 7:    /* target to bug */
        this.mutateBug(1);
        break;
      case 8:    /* bug to target */
        this.mutateBug(0);
        break;
      case 9:    /* bug to target */
        this.mutateBug(0);
        break;
      case 10:   /* color scheme */
        this.colorScheme = miscMath.fRand(this.NUM_SCHEMES - 1);
        if (this.colorScheme == this.RANDOM_SCHIZO || this.colorScheme == this.COLOR_SCHIZO) {
          this.colorScheme = miscMath.fRand(this.NUM_SCHEMES - 1);
        } // if
        break;
        
      default:
        this.randomSmallChange();
        this.randomSmallChange();
        this.randomSmallChange();
        this.randomSmallChange();
        break;
    }
    
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
  /*** randomSmallChange *****************************************************/
  
  
  
  /*** randomBigChange ********************************************************
   *
   ***************************************************************************/
  randomBigChange(){
    let whichcase = 0;
    let temp = 0;
    
    whichcase = Math.floor(Math.random() * 4);
    
    this.callDepth = this.callDepth + 1;
    if (this.callDepth > 3) {
      this.callDepth = this.callDepth - 1;
      return;
    } // if
    
    switch(whichcase){
      case 0:
        ///* trail length */
        temp = (Math.random() * (this.MAX_TRAIL_LEN - 25)) + 25;
        this.clearBugs();
        this.trailLen = temp;
        this.computeColorIndices();
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
        temp = miscMath.fRand(this.ntargets - 1);
        this.targets[temp].pos[0] = this.targets[temp].pos[0] + (miscMath.fRand(this.maxx / 4) - this.maxx / 8);
        this.targets[temp].pos[1] = this.targets[temp].pos[1] + (miscMath.fRand(this.maxy / 4) - this.maxy / 8);
        ///* updateState() will fix bounds */
        //updateState //will fix bounds
    }
    
    this.callDepth = this.callDepth - 1;
  } 
  /*** randomBigChange *******************************************************/
  
  
  
  /*** screenhack *************************************************************
   *
   ***************************************************************************/
  screenhack(w /* as window */){
    let nframes = 0;
    let i = 0;
    let fps = 0.0;
    let timePerFrame = 0.0;
    let elapsed = 0.0;
    let targetColorIndex= []; // as Long
    let colorIndex= []; // as Long
    let targetStartColor = 0;
    let targetNumColors = 0;
    let startColor = 0;
    let numColors = 0;
    let sTime = 0.0;
    let eTime = 0.0;
    let cnt = 0;
    let sleepCount = 0;
    let delayAccum = 0;
    
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
    this.computeColorIndices();
    
    if (this.changeProb > 0) {
      for(i = (Math.random() * 5) + 5 ; i >= 0; i--){
        this.randomSmallChange();
      }
    }
    
    this.nframes = 0;
    this.sTime = Date.now().getTime();
    
    while (this.sleepCount <= 2 && this.Continue()){
      //DoEvents
      if (this.delay > 0) {
        this.cnt = 2;
        this.dt = this.DESIRED_DT / 2;
      }
      else{
        this.cnt = 1;
        this.dt = this.DESIRED_DT;
      } // if
      
      for(cnt = cnt; cnt >= 1; cnt--){
        this.updateState();
        this.updateColorIndex(targetColorIndex, targetStartColor, targetNumColors, colorIndex, startColor, numColors);
        this.drawBugs(targetColorIndex, targetStartColor, targetNumColors, colorIndex, startColor, numColors);
        //win.Refresh
        //DoEvents
        if (! this.Continue) {
          break;
        }
      }
      eTime = Date.now().getTime();
      this.nframes = this.nframes + 1;
      
      if (eTime > (sTime+500)) {
        if (miscMath.fRand(1) < this.changeProb) {
          this.randomSmallChange();
        } // if
        if (miscMath.fRand(1) < this.changeProb * 0.3) {
          this.randomBigChange();
        } // if
        
        elapsed = this.eTime - this.sTime;
        
        this.timePerFrame = elapsed / this.nframes - this.delay * 0.000001;
        this.fps = this.nframes / elapsed;
        //debug.Print ("elapsed: " & elapsed)
        //debug.Print ("secs per frame: " & timePerFrame)
        //debug.Print ("delay: " & delay)
        
        if (this.fps > this.MAX_FPS) {
          this.delay = (1 / this.MAX_FPS - (this.timePerFrame + this.delay * 0.000001)) * 1000000;
        }
        else if (this.dt * this.fps < this.MIN_FPS * this.DESIRED_DT) {
          // need to speed things up somehow
          // Obviously we are taking to long to do the processing. Somehow 
          // we need to reduce the processing time. A couple of suggestions are
          // explored below: too many bugs, delay time can be made a little 
          // longer, we can make the bugs shorter in length
          if (this.nbugs > 10) { //always evaluate to false?
            /*printf("reducing bugs to improve speed.\n");*/
            this.nbugs = this.nbugs * this.fps / this.MIN_FPS;
            if (this.ntargets >= this.nbugs / 2) {
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
            this.computeColorIndices();
            this.initBugs();
          }
        }
        
        sTime = Date.now().getTime();
        this.nframes = 0;
      }
      
      if (this.delay > 10000) {
        //Sleep (delay)
      }
      else{
        this.delayAccum = this.delayAccum + this.delay;
        if (this.delayAccum > 10000) {
          this.delayAccum = 0;
          this.sleepCount = 0;
        }
        this.sleepCount = this.sleepCount + 1;
        if (this.sleepCount > 2) {
            this.sleepCount = 0;
        }
      }
      if (this.win == null) {
        this.sleepCount = 100;
      }
      else if (! this.win.Visible) {
        this.sleepCount = 100;
      }
    }
  }
  /*** screenhack ************************************************************/
  
  
  
  /*** updateState ************************************************************
   *
   ***************************************************************************/
  updateState(){
    let i = 0;
    let b; // As bug
    let ax = 0.0;
    let ay = 0.0;
    let temp = 0.0;
    let theta = 0.0;
    
    this.updateState_checkIndex = 0;
    
    let b2;// As bug
    let j = 0;
    
    this.head = (this.head + 1) % this.trailLen;
    
    for(j = 0; j < this.nbugs; j++){
      /* update closets bug for the bug indicated by checkIndex */
      b = this.bugs(this.updateState_checkIndex);
      
      // based on the x/y coordinates of the bug, and it's closest target, use
      // pythagorean theorum to determine its distance
      ax = b.closest.pos[0] - b.pos[0];
      ay = b.closest.pos[1] - b.pos[1];
      temp = miscMath.sq(ax) + miscMath.sq(ay);
      for(i = 0; i < this.ntargets; i++){
        b2 = this.targets[i];
        if (b2 === b.closest) break;
        
        // if this item is closer than the one we think is closest, mark this
        // one as the closest
        ax = b2.pos[0] - b.pos[0];
        ay = b2.pos[1] - b.pos[1];
        theta = miscMath.sq(ax) + miscMath.sq(ay);
        if (theta * 2 < temp) {
          b.closest = b2;
          temp = theta;
        } // if
      }
      this.updateState_checkIndex = (this.updateState_checkIndex + 1) % this.nbugs;
    }
    
    /* update target state */
    for(i = 0; i < this.ntargets; i++){
      b = this.targets[i];
      theta = miscMath.fRand(Math.PI * 2);
      ax = this.targetAcc * Math.cos(theta);
      ay = this.targetAcc * Math.sin(theta);
      
      b.vel[0] = b.vel[0] + ax * this.dt;
      b.vel[1] = b.vel[1] + ay * this.dt;
      
      /* check velocity */
      temp = miscMath.sq(b.vel[0]) + miscMath.sq(b.vel[1]);
      if (temp > this.targetVelSq) {
        temp = this.targetVel / miscMath.sqrt(temp);
        /* save old vel for acc computation */
        ax = b.vel[0];
        ay = b.vel[1];
        
        /* compute new velocity */
        b.vel[0] *= temp;
        b.vel[1] *= temp;
        
        /* update acceleration */
        ax = (b.vel[0] - ax) * this.dtInv;
        ay = (b.vel[1] - ay) * this.dtInv;
      }
      
      /* update position */
      b.pos[0] += (b.vel[0] * this.dt + ax * this.halfDtSq);
      b.pos[1] += (b.vel[1] * this.dt + ay * this.halfDtSq);
      
      /* check limits on targets */
      if (b.pos[0] < 0) {
        /* bounce */
        b.pos[0] = -1 * b.pos[0];
        b.vel[0] = -1 * b.vel[0];
      }
      else if (b.pos[0] >= this.maxx) {
        /* bounce */
        b.pos[0] = 2 * this.maxx - b.pos[0];
        b.vel[0] = -1 * b.vel[0];
      }
      if (b.pos[1] < 0) {
        /* bounce */
        b.pos[1] *= -1;
        b.vel[1] *= -1;
      }
      else if (b.pos[1] >= this.maxy) {
        /* bounce */
        b.pos[1] = 2 * this.maxy - b.pos[1];
        b.vel[1] *= -1;
      }
      
      b.hist[this.head][0] = b.pos[0] * this.xsize;
      b.hist[this.head][1] = b.pos[1] * this.xsize;
    }
    
    /* update bug state */
    for(i = 0; i<this.nbugs; i--){
      b = this.bugs[i];
      
      theta = Math.atan(b.closest.pos[1] - b.pos[1] + miscMath.fRand(this.noise) - (this.noise / 2), b.closest.pos[0] - b.pos[0] + miscMath.fRand(this.noise) - (this.noise / 2));
      ax = this.maxAcc * Math.cos(theta);
      ay = this.maxAcc * Math.sin(theta);
      
      b.vel[0] = b.vel[0] + ax * this.dt;
      b.vel[1] = b.vel[1] + ay * this.dt;
      
      /* check velocity */
      temp = miscMath.sq(b.vel[0]) + miscMath.sq(b.vel[1]);
      if (temp > this.maxVelSq) {
        temp = this.maxVel / miscMath.sqrt(temp);
        
        /* save old vel for acc computation */
        ax = b.vel[0];
        ay = b.vel[1];
        
        /* compute new velocity */
        b.vel[0] *= temp;
        b.vel[1] *= temp;
        
        /* update acceleration */
        ax = (b.vel[0] - ax) * this.dtInv;
        ay = (b.vel[1] - ay) * this.dtInv;
      }
      else if (temp < this.minVelSq) {
        temp = this.minVel / miscMath.sqrt(temp);
        
        /* save old vel for acc computation */
        ax = b.vel[0];
        ay = b.vel[1];
        
        /* compute new velocity */
        b.vel[0] *= temp;
        b.vel[1] *= temp;
        
        /* update acceleration */
        ax = (b.vel[0] - ax) * this.dtInv;
        ay = (b.vel[1] - ay) * this.dtInv;
      }
      
      /* update position */
      b.pos[0] += (b.vel(0) * this.dt + ax * this.halfDtSq);
      b.pos[1] += (b.vel(1) * this.dt + ay * this.halfDtSq);
      
      b.hist[this.head][0] = b.pos[0] * this.xsize;
      b.hist[this.head][1] = b.pos[1] * this.xsize;
    }
    
  }
  /*** updateState ***********************************************************/
  
  
  
  /*** updateColorIndex *******************************************************
   *
   ***************************************************************************/
  updateColorIndex(tColorIdx,tci0,tnc,colorIdx,ci0,nc){
    switch(this.colorScheme){
      case this.COLOR_TRAILS:
        tColorIdx = this.redIndex;
        tci0 = 0;
        tnc = this.trailLen;
        colorIdx = this.blueIndex;
        ci0 = 0;
        nc = this.trailLen;
        break;
      case this.GRAY_SCHIZO:
        tColorIdx = this.graySIndex;
        tci0 = this.head;
        tnc = this.trailLen;
        colorIdx = this.graySIndex;
        ci0 = this.head;
        nc = this.trailLen;
        break;
      case this.COLOR_SCHIZO:
        tColorIdx = this.redSIndex;
        tci0 = this.head;
        tnc = this.trailLen;
        colorIdx = this.blueSIndex;
        ci0 = this.head;
        nc = this.trailLen;
        break;
      case this.GRAY_TRAILS:
        tColorIdx = this.grayIndex;
        tci0 = 0;
        tnc = this.trailLen;
        colorIdx = this.grayIndex;
        ci0 = 0;
        nc = this.trailLen;
        break;
      case this.RANDOM_TRAILS:
        tColorIdx = this.redIndex;
        tci0 = 0;
        tnc = this.trailLen;
        colorIdx = this.randomIndex;
        ci0 = 0;
        nc = this.trailLen;
        break;
      case this.RANDOM_SCHIZO:
        tColorIdx = this.redIndex;
        tci0 = this.head;
        tnc = this.trailLen;
        colorIdx = this.randomIndex;
        ci0 = this.head;
        nc = this.trailLen;
        break;
    }
  }
  /*** updateColorIndex ******************************************************/
  
  
  
  /*** CreateParams ***********************************************************
   *
   ***************************************************************************/
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
