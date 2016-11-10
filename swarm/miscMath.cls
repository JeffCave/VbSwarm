VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "miscMath"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
'*****************************************************************************
'* $Id: miscMath.cls 17 2004-04-15 22:33:33Z jeff.cave $
'*****************************************************************************
Option Explicit


Public Property Get ProgClass() As String
  ProgClass = "miscMath"
End Property

'*** PI **********************************************************************
'* Constant value for PI.
'* (3.141592654)
'******************************************************************************
Public Static Property Get PI() As Double
  On Error GoTo ERROR_PI
  PI = 3.141592654
Exit Property
ERROR_PI:
  ReportError Me.ProgClass & ".PI"
End Property
'*** PI ***********************************************************************



'*** fRand ********************************************************************
'* mimics the C frand fucntion
'******************************************************************************
Public Static Function fRand(Optional ByVal maxVal As Double = 1) As Double
  On Error GoTo ERROR_fRand
  fRand = Rnd() * maxVal
Exit Function
ERROR_fRand:
  ReportError Me.ProgClass & ".fRand"
End Function
'*** fRand ********************************************************************



'*** sq ***********************************************************************
'* Calculates the square of value.
'******************************************************************************
Public Static Function sq(ByVal x As Double) As Double
  On Error GoTo ERROR_sq
  sq = x * x
Exit Function
ERROR_sq:
  ReportError Me.ProgClass & ".sq"
End Function
'*** sq ***********************************************************************



'*** sqrt *********************************************************************
'*
'******************************************************************************
Public Static Function sqrt(ByVal x As Double) As Double
  On Error GoTo ERROR_sqrt
  sqrt = Sqr(x)
Exit Function
ERROR_sqrt:
  ReportError Me.ProgClass & ".sqrt"
End Function
'*** sqrt *********************************************************************



'*** atan *********************************************************************
'*
'******************************************************************************
Public Static Function atan(ByVal y As Double, ByVal x As Double) As Double
  On Error GoTo ERROR_atan
  atan = Atn(Abs(y) / Abs(x))
  If (x < 0) Then
    If (y < 0) Then
      atan = PI + atan
    Else
      atan = PI - atan
    End If
  Else
    If (y < 0) Then
      atan = 2 * PI - atan
    Else
      atan = 0 + atan
    End If
  End If
Exit Function
ERROR_atan:
  ReportError Me.ProgClass & ".atan"
End Function
'*** atan *********************************************************************



'*** WrapByte *****************************************************************
'*
'******************************************************************************
Public Function WrapByte(b As Long) As Byte
  If (b < 0) Then
    WrapByte = WrapByte(255 - b)
  Else
    WrapByte = b Mod 255
  End If
End Function
'*** WrapByte *****************************************************************


