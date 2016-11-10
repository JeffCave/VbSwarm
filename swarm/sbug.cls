VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "bug"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
'*****************************************************************************
'* $Id: sbug.cls 17 2004-04-15 22:33:33Z jeff.cave $
'*****************************************************************************
Option Explicit

Private pPos() As Double
Private pHist() As Long
Private pVel() As Double

Public swarm As clsSwarm
Public closest As bug

Public Static Property Get ProgClass() As String
  ProgClass = "bug"
End Property

Public Property Get MAX_TRAIL_LEN() As Long
  MAX_TRAIL_LEN = swarm.Params.Item("TrailLen").Val
End Property

Public Property Get pos(i As Long) As Double
  On Error GoTo ERROR_pos
  
  If (i > UBound(pPos) Or i < LBound(pPos)) Then
    'error
    Err.Raise -1, "bug", "Index " & i & " outside valid range (" & LBound(pPos) & "-" & UBound(pPos) & ")"
  End If
  
  pos = pPos(i)
  
ERROR_pos:
  ReportError "bug.pos (get)"
End Property

Public Property Let pos(i As Long, ByVal newPos As Double)
  On Error GoTo ERROR_pos
  
  If (i > UBound(pPos) Or i < LBound(pPos)) Then
    'error
    Err.Raise -1, "bug", "Index " & i & " outside valid range (" & LBound(pPos) & "-" & UBound(pPos) & ")"
  End If
  'If (newPos > 1) Then
  '  newPos = 1
  'End If
  'If (newPos < 0) Then
  '  newPos = 0
  'End If
  pPos(i) = newPos
  
ERROR_pos:
  ReportError "bug.pos (let)"
End Property

Public Property Get hist(x As Long, y As Long) As Long
  On Error GoTo ERROR_hist
  
  hist = pHist(x, y)
  
ERROR_hist:
  ReportError "bug.hist (get)"
End Property

Public Property Let hist(x As Long, y As Long, newHist As Long)
  On Error GoTo ERROR_lethist
  
  pHist(x, y) = newHist
  
ERROR_lethist:
  ReportError "bug.hist (let)"
End Property

Public Property Get vel(i As Long) As Double
  On Error GoTo ERROR_getvel
  
  If (i > UBound(pPos) Or i < LBound(pPos)) Then
    'error
    Err.Raise -1, "bug", "Index " & i & " outside valid range (" & LBound(pPos) & "-" & UBound(pPos) & ")"
  Else
    vel = pVel(i)
  End If
  
ERROR_getvel:
  ReportError "bug.vel (get)"
End Property



'*** let vel *****************************************************************
'*
'*****************************************************************************
Public Property Let vel(i As Long, newVel As Double)

  If (i > UBound(pVel) Or i < LBound(pVel)) Then
    'error
    Err.Raise -1, "bug", "Index " & i & " outside valid range (" & LBound(pPos) & "-" & UBound(pPos) & ")"
  Else
    pVel(i) = newVel
  End If
  
End Property
'*** let vel *****************************************************************



'*** Class_Initialize *********************************************************
'*
'******************************************************************************
Private Sub Class_Initialize()
  ReDim pPos(2)
  ReDim pHist(100, 2)
  ReDim pVel(2)
End Sub
'*** Class_Initialize *********************************************************



'*** Class_Terminate **********************************************************
'*
'******************************************************************************
Private Sub Class_Terminate()
  Set Me.closest = Nothing
End Sub
'*** Class_Terminate **********************************************************


