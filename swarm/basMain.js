/*****************************************************************************
 * 
 *****************************************************************************/
'use strict';

/* global Swarm */


var engine = null;
var canvas;

/**
 * Main
 *
 */
function main(){
  canvas = document.querySelector('canvas');
  engine = new Swarm(canvas);
  
  LoadSettings();
  StartScreensaver();
}
document.addEventListener('DOMContentLoaded',main);



/**
 * LoadSettings
 *
 * Read the current options from the registry.
 *
 */
function LoadSettings(){
/*
  Dim i As Long
  Dim upper As Long
  
  Dim keys() As Variant
  Dim value As String
  
  Dim p As Param
  
  If (engine Is Nothing) Then
    Set engine = New clsSwarm
  End If
  
  With engine
    keys = .Params.keys()
    upper = .Params.Count - 1
    
    For i = 0 To upper
      Set p = .Params.Item(keys(i))
      fReadValue "HKCU", cREGKEY, keys(i), "S", p.asString, value
      p.asString = value
    Next
  End With
  
  Set p = Nothing
*/
}



/** 
 * StartScreenSaver 
 *
 */
function StartScreensaver(){
  engine.screenhack(canvas);
}

