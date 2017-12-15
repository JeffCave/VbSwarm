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

