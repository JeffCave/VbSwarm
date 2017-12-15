/*****************************************************************************
//* $Id: miscMath.cls 17 2004-04-15 22:33:33Z jeff.cave $
//*****************************************************************************/
'use strict';

class miscMath{
  
  get ProgClass(){
    return "miscMath";
  }
  
  
  //*** PI **********************************************************************
  //* Constant value for PI.
  //* (3.141592654)
  //******************************************************************************
  static get PI(){// As Double
    console.debug('Deprecated: miscMath.PI');
    return Math.PI;
  }
  //*** PI ***********************************************************************
  
  
  
  //*** fRand ********************************************************************
  //* mimics the C frand fucntion
  //******************************************************************************
  static fRand(maxVal){
    console.debug("Deprecated: miscMath.fRand");
    if(maxVal !== 0 && !maxVal){
      maxVal = 1;
    }
    
    let val = Math.random() * maxVal; // Rnd() * maxVal
    return val;
  }
  //*** fRand ********************************************************************
  
  
  
  //*** sq ***********************************************************************
  //* Calculates the square of value.
  //******************************************************************************
  static sq(x){
    return Math.pow(x,2);
  }
  //*** sq ***********************************************************************
  
  
  
  //*** sqrt *********************************************************************
  //*
  //******************************************************************************
  static sqrt(x){
    let root = Math.pow(x,0.5);
    return root;
  }
  //*** sqrt *********************************************************************
  
  
  
  //*** atan *********************************************************************
  //*
  //******************************************************************************
  static atan(y,x){
    return Math.atan(y,x);
  }
  //*** atan *********************************************************************
  
  
  
  //*** WrapByte *****************************************************************
  //*
  //******************************************************************************
  static WrapByte(b){
    if (b < 0){
      return this.WrapByte(256 - b);
    }
    else{
      return b % 256;
    }
  }
  //*** WrapByte *****************************************************************
  
  
}