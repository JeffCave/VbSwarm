/*****************************************************************************
 * $Id: miscMath.cls 17 2004-04-15 22:33:33Z jeff.cave $
 *****************************************************************************/
'use strict';


Math.rand = Math.rand || function(maxVal){
  if(maxVal !== 0 && !maxVal){
    maxVal = 1;
  }
  let val = Math.random() * maxVal; // Rnd() * maxVal
  return val;
};


class miscMath{
  /**
   * WrapByte
   *
   */
  static WrapByte(b){
    if (b < 0){
      return this.WrapByte(256 - b);
    }
    else{
      return b % 256;
    }
  }
  
  
}
