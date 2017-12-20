/******************************************************************************
* $Id$
******************************************************************************/
'use strict';

class POINTAPI{
  constructor(){
    this.x = 0;
    this.y = 0;
  }
};


class RECT{
  constructor(){
    this.Left   = 0;
    this.Top    = 0;
    this.Right  = 0;
    this.Bottom = 0;
  }
}

class BITMAP{
  constructor(){
    this.bmType       = 0;
    this.bmWidth      = 0;
    this.bmHeight     = 0;
    this.bmWidthBytes = 0;
    this.bmPlanes     = 0;
    this.bmBitsPixel  = 0;
    this.bmBits       = 0;
  }
  
}

class SECURITY_ATTRIBUTES{
  constructor(){
    this.nLength              = 0;
    this.lpSecurityDescriptor = 0;
    this.bInheritHandle       = true;
  }
}

class ResBitmap{
  constructor(){
    this.ResID  = 0;
    this.Sprite = [];//As StdPicture
  }
}


class RGB{
  constructor(red,green,blue,opacity){
    this.red = Math.floor(red);
    this.green = Math.floor(green);
    this.blue = Math.floor(blue);
    
    this.opacity = 1;
    if(typeof opacity !== 'undefined'){
      this.opacity = opacity;
    }
    if(this.opacity > 1){
      this.opacity = 1;
    }
    if(this.opacity < 0){
      this.opacity = 0;
    }
  }
  
  get HexCode(){
    return [
        this.red.toString(16).padStart(2,'0'),
        this.green.toString(16).padStart(2,'0'),
        this.blue.toString(16).padStart(2,'0'),
      ].join('');
  }
  
  get HtmlCode(){
    //return "#" + this.HexCode + ';';
    return "rgba("+[this.red,this.green,this.blue,this.opacity].join(',')+")";
  }
  
  get numeric(){
    let num = 0;
    num += this.red;
    num = num << 8;
    num += this.green; 
    num *= 256;
    num += this.blue;
    return num;
  }
  
}
