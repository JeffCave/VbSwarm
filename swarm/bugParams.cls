VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "bugParams"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
'******************************************************************************
'* $Id: bugParams.cls 17 2004-04-15 22:33:33Z jeff.cave $
'* In the original C program, these values were stored in a structure that was
'* passed around by pointer. I have created this class to mimic that.
'******************************************************************************
Option Explicit

Public dt As Double
Public targetVel As Double
Public targetAcc As Double
Public maxVel As Double
Public maxAcc As Double
Public noise As Double
Public nbugs As Long
Public ntargets As Long
Public trailLen As Long
Public colorScheme As Long
Public changeProb As Double
  
'*** Class_Initialize ********************************************************
'*
'*****************************************************************************
Private Sub Class_Initialize()
  'set the default values
  With Me
    .dt = 0.3
    .targetVel = 0.03
    .targetAcc = 0.02
    .maxVel = 0.05
    .maxAcc = 0.03
    .noise = 0.01
    .noise = 0.05
    .nbugs = -1
    .ntargets = -1
    .trailLen = 60
    .colorScheme = 2
    .changeProb = 0.15
  End With
End Sub
'*** Class_Initialize ********************************************************

