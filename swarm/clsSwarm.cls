VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "clsSwarm"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
'*****************************************************************************
'* $Id: clsSwarm.cls 19 2004-04-16 14:29:44Z jeff.cave $
'*****************************************************************************
Option Explicit

'******************************************************************************
'* This code modified from its original C source by Jeff Cave (k@vius.ca)
'*
'* Included below is the original Copyright notice and licencing. I'm not a
'* lawyer. So I am not going to even try to apply changes to it. The copyright
'* notice below is the copyright on the code associated with this document.
'*
'* This code is available intersperced with the C comments: revision 5.
'******************************************************************************
'/*
' * Copyright (c) 2000 by Chris Leger (xrayjones@users.sourceforge.net)
' *
' * xrayswarm - a shameless ripoff of the 'swarm' screensaver on SGI
' *   boxes.
' *
' * Version 1.0 - initial release.  doesn't read any special command-line
' *   options, and only supports the variable 'delay' via Xresources.
' *   (the delay resouces is most useful on systems w/o gettimeofday, in
' *   which case automagical level-of-detail for FPS maintainance can't
' *   be used.)
' *
' *   The code isn't commented, but isn't too ugly. It should be pretty
' *   easy to understand, with the exception of the colormap stuff.
' *
' */
'/*
'Permission is hereby granted, free of charge, to any person obtaining
'a copy of this software and associated documentation files (the
'"Software"), to deal in the Software without restriction, including
'without limitation the rights to use, copy, modify, merge, publish,
'distribute, sublicense, and/or sell copies of the Software, and to
'permit persons to whom the Software is furnished to do so, subject to
'the following conditions:
'
'The above copyright notice and this permission notice shall be included
'in all copies or substantial portions of the Software.
'
'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
'OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
'MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
'IN NO EVENT SHALL THE X CONSORTIUM BE LIABLE FOR ANY CLAIM, DAMAGES OR
'OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
'ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
'OTHER DEALINGS IN THE SOFTWARE.
'
'Except as contained in this notice, the name of the X Consortium shall
'not be used in advertising or otherwise to promote the sale, use or
'other dealings in this Software without prior written authorization
'from the X Consortium.
'*/
'******************************************************************************

Private Math As miscMath

Private Declare Function GetAddrOf Lib "kernel32" Alias "MulDiv" (nNumber As Any, Optional ByVal nNumerator As Long = 1, Optional ByVal nDenominator As Long = 1) As Long
Private Declare Sub Sleep Lib "kernel32" (ByVal dwMilliseconds As Long)

Private colors(0 To 255) As Long

Private win As Form
Private xsize As Long
Private ysize As Long
Private xc As Long
Private yc As Long
Private delay As Long
Private maxx As Double
Private maxy As Double
'/**********************************************************************/

Private nbugs As Long
Private ntargets As Long
Private ntotbugs As Long
Private trailLen As Long

'/* vars dependent on those above */
Private dtInv As Double
Private halfDtSq As Double
Private maxVelSq As Double
Private targetVelSq As Double
Private minVelSq As Double
Private minVel As Double

Private Const GRAY_TRAILS As Long = 0
Private Const COLOR_TRAILS As Long = 1
Private Const RANDOM_TRAILS As Long = 2
Private Const GRAY_SCHIZO As Long = 3
Private Const RANDOM_SCHIZO As Long = 4
Private Const COLOR_SCHIZO As Long = 5
Private Const NUM_SCHEMES As Long = 3

Private bugs() As bug
Private targets() As bug
Private allbugs() As bug
Private head As Long
Private tail As Long
Private colorScheme As Long
Private changeProb As Double

Private grayIndex() As Long
Private redIndex() As Long
Private blueIndex() As Long
Private graySIndex() As Long
Private redSIndex() As Long
Private blueSIndex() As Long
Private randomIndex() As Long
Private numColors As Long
Private numRandomColors As Long

Private good1 As bugParams

'Private goodParams() As bugParams

Private dt               As Double
Private targetVel        As Double
Private targetAcc        As Double
Private maxVel           As Double
Private maxAcc           As Double
Private noise            As Double
Private minVelMultiplier As Double

'*** Property Variables *******************************************************
Public Continue As Boolean
Public Params   As Scripting.Dictionary
'*** Property Variables *******************************************************



'*** initVar ******************************************************************
'* In the 'C' version, there are a lot of variables that are initialized at
'* the same time that they are declared. Since this is not possible in VB, we
'* call initVar to initialize them when the class is created.
'******************************************************************************
Private Static Sub initVar()
  
  With good1
    .trailLen = Params.Item("TrailLen").Val
  End With
  
  ReDim goodParams(0)
  Set goodParams(0) = good1

  ReDim bugs(MAX_BUGS) As bug
  ReDim targets(MAX_TARGETS) As bug
  ReDim allbugs(MAX_TARGETS + MAX_BUGS) As bug
  head = 0
  tail = 0
  colorScheme = -1
  changeProb = 0.08

  With good1
    dt = .dt
    targetVel = .targetVel
    targetAcc = .targetAcc
    maxVel = .maxVel
    maxAcc = .maxAcc
    noise = .noise
  End With
  minVelMultiplier = 0.5

  ReDim grayIndex(MAX_TRAIL_LEN)
  ReDim redIndex(MAX_TRAIL_LEN)
  ReDim blueIndex(MAX_TRAIL_LEN)
  ReDim graySIndex(MAX_TRAIL_LEN)
  ReDim redSIndex(MAX_TRAIL_LEN)
  ReDim blueSIndex(MAX_TRAIL_LEN)
  ReDim randomIndex(MAX_TRAIL_LEN)
  
  nbugs = -1
  ntargets = -1
  trailLen = -1

End Sub
'*** initVar ******************************************************************



'*** get MAX_TRAIL_LEN ********************************************************
'*
'******************************************************************************
Private Property Get MAX_TRAIL_LEN() As Long
  MAX_TRAIL_LEN = Params.Item("TrailLen").MAX
End Property
'*** get MAX_TRAIL_LEN ********************************************************

Public Property Get MAX_BUGS() As Long
  MAX_BUGS = 50
End Property

Public Property Get MAX_TARGETS() As Long
  MAX_TARGETS = 5
End Property

Public Property Get MAX_TOTBUGS() As Long
  MAX_TOTBUGS = MAX_BUGS + MAX_TARGETS
End Property

Private Property Get MAX_FPS() As Long: MAX_FPS = 150: End Property
Private Property Get MIN_FPS() As Long: MIN_FPS = 16: End Property
Private Property Get DESIRED_DT() As Double: DESIRED_DT = 0.2: End Property

Private Property Get numParamSets() As Long: numParamSets = 1: End Property

Public Static Property Get ProgClass() As String
  ProgClass = "Swarm"
End Property

Public Static Property Get Title() As String
  Title = "XRaySwarm"
End Property

'/*****************************************************************************/
'static void clearBugs(void);
'void computeColorIndices(void);
'static void initBugs(void);
'void initCMap(void);
'static int initGraphics(void);
'static void pickNewTargets(void);
'static void computeConstants(void);
'static void setParams(bugParams);
'static void drawBugs(int *tColorIdx, int tci0, int tnc, int *colorIdx, int ci0, int nc);
'void updateState(void);
'void mutateBug(int which);
'void mutateParam(float *param);
'void randomSmallChange(void);
'void randomBigChange(void);
'void updateColorIndex(int **tColorIdx, int *tci0, int *tnc, int **colorIdx, int *ci0, int *nc);
'static void initTime(void);
'static double getTime(void);
'void screenhack(Display *d, Window w);
'/*****************************************************************************/



'/*** clearBugs ***************************************************************
'* Clear the screen of bugs
'*****************************************************************************/
Public Sub clearBugs()
  On Error GoTo ERROR_ClearBugs
  Dim b As bug
  Dim i As Long
  Dim j As Long
  Dim temp As Long

  tail = tail - 1
  If (tail < 0) Then
    tail = trailLen - 1
  End If

  If ((head + 1) Mod (trailLen - 1) = tail) Then
    temp = (tail + 1) Mod trailLen

    For i = 0 To ntotbugs - 1
      Set b = allbugs(i)
      win.Line (b.hist(tail, 0), b.hist(tail, 1))-(b.hist(temp, 0), b.hist(temp, 1))
    Next
    
    temp = (tail + 1) Mod (trailLen - 1)
  End If

  j = tail
  While (j <> head)
    temp = (j + 1) Mod (trailLen)

    win.ForeColor = vbBlack
    For i = 0 To ntotbugs - 1
      DoEvents
      Set b = allbugs(i)
      win.Line (b.hist(j, 0), b.hist(j, 1))-(b.hist(temp, 0), b.hist(temp, 1))
    Next

    j = temp
  Wend

Exit Sub
ERROR_ClearBugs:
  ReportError Me.ProgClass & ".clearBugs"
End Sub
'/*** clearBugs **************************************************************/



'/*** computeConstants ********************************************************
'*
'*****************************************************************************/
Private Static Sub computeConstants()
  On Error GoTo ERROR_computeConstants
  halfDtSq = Math.sq(dt) * 0.5
  dtInv = 1 / dt
  targetVelSq = Math.sq(targetVel)
  maxVelSq = Math.sq(maxVel)
  minVel = maxVel * minVelMultiplier
  minVelSq = Math.sq(minVel)
Exit Sub
ERROR_computeConstants:
  ReportError Me.ProgClass & ".computerConstants"
End Sub
'/*** computeConstants *******************************************************/



'/*** computeColorIndices *****************************************************
'*
'*****************************************************************************/
Public Sub computeColorIndices()
  On Error GoTo ERROR_computeColorIndices
  
  Dim i As Long
  Dim redSchizoLength As Long
  Dim blueSchizoLength As Long

  '/* note: colors are used in *reverse* order! */
  
  redSchizoLength = trailLen / 4
  blueSchizoLength = trailLen / 2

  For i = trailLen - 1 To 0 Step -1
    'grayscale
    'grayIndex(i) = 4 + (i * 16 / trailLen) + 0.5
    grayIndex(i) = 4 + i
    If (grayIndex(i) > 19) Then grayIndex(i) = 19
    'red
    redIndex(i) = 20 + (i * 16 / trailLen) + 0.5
    If (redIndex(i) > 35) Then redIndex(i) = 35
    'blue
    blueIndex(i) = 36 + (i * 16 / trailLen) + 0.5
    If (blueIndex(i) > 51) Then blueIndex(i) = 51
    'grayschizo
    'graySIndex(i) = 4 + (i * 16 / trailLen) + 0.5
    graySIndex(i) = grayIndex(i)
    'red schizo
    redSIndex(i) = 20 + (i * 16 / trailLen) + 0.5
    If (redSIndex(i) > 35) Then redSIndex(i) = 35
    'blue schizo
    blueSIndex(i) = 36 + 16 * ((trailLen - 1 - i) Mod blueSchizoLength) / (blueSchizoLength - 1) + 0.5
    If (blueSIndex(i) > 51) Then blueSIndex(i) = 51
    'random
    randomIndex(i) = 52 + Rnd() * numRandomColors
    'debug.Print i
  Next
Exit Sub
ERROR_computeColorIndices:
  ReportError Me.ProgClass & ".computeColorIndicies"
End Sub
'/*** computeColorIndices ****************************************************/



'/*** drawBugs ****************************************************************
'*
'*****************************************************************************/
Public Sub drawBugs(ByRef tColorIdx() As Long, ByVal tci0 As Long, ByVal tnc As Long, ByRef colorIdx() As Long, ByVal ci0 As Long, ByVal nc As Long)
  On Error GoTo ERROR_drawBugs
  Dim b As bug
  Dim i As Long
  Dim j As Long
  Dim temp As Long
  Dim colour As Long

  If ((head + 1) Mod (trailLen) = tail) Then
    '/* first, erase last segment of bugs if necessary */
    temp = (tail + 1) Mod (trailLen)
    
    colour = vbBlack

    For i = 0 To ntotbugs - 1
      Set b = allbugs(i)
      win.ForeColor = colour
      win.Line (b.hist(tail, 0), b.hist(tail, 1))-(b.hist(temp, 0), b.hist(temp, 1))
    Next
    
    Set b = Nothing
    tail = (tail + 1) Mod (trailLen)
  End If

  j = tail
  While (j <> head)
    temp = (j + 1) Mod (trailLen)

    colour = colors(colorIdx(nc - ci0))
    win.ForeColor = colour
    For i = 0 To ntotbugs - 1
      Set b = allbugs(i)
      win.Line (b.hist(j, 0), b.hist(j, 1))-(b.hist(temp, 0), b.hist(temp, 1))
    Next

    ci0 = (ci0 + 1) Mod nc
    tci0 = (tci0 + 1) Mod tnc
    
    j = temp
    
  Wend
  Set b = Nothing
Exit Sub
ERROR_drawBugs:
  ReportError Me.ProgClass & ".drawBugs"
End Sub
'/*** drawBugs ***************************************************************/



'/*** initBugs *****************************************************************
'*
'******************************************************************************/
Private Sub initBugs()
  On Error GoTo ERROR_initBugs
  Dim b As bug
  Dim i As Long
  Dim MSG As String

  head = 0
  tail = 0
  
  '*** Test Values ***
  '*
  'nbugs = 2
  'ntargets = 1
  'trailLen = 20
  '*
  '*** Test Values ***

  MSG = "(Doing ntargets)"
  If (ntargets < 0) Then
    ntargets = (0.25 + Math.fRand(0.75) * Math.fRand(1)) * (MAX_TARGETS - 1) + 1
  End If
  If (nbugs < 0) Then
    nbugs = (0.25 + Math.fRand(0.75) * Math.fRand(1)) * (MAX_BUGS - 1) + 1
  End If
  If (trailLen < 0) Then
    'trailLen = (1 - Math.fRand(0.6) * Math.fRand(1)) * MAX_TRAIL_LEN
    trailLen = Params.Item("TrailLen").Val
  End If

  MSG = "(Doing step2)"
  If (nbugs > MAX_BUGS) Then nbugs = MAX_BUGS
  If (ntargets > MAX_TARGETS) Then ntargets = MAX_TARGETS
  If (trailLen > MAX_TRAIL_LEN) Then trailLen = MAX_TRAIL_LEN
  
  ntotbugs = ntargets + nbugs

  MSG = "(Doing step 3)"
  For i = 0 To ntotbugs - 1
    Set allbugs(i) = New bug
  Next
  For i = 0 To nbugs - 1
    Set bugs(i) = allbugs(i)
  Next
  For i = i To ntotbugs - 1
    Set targets(i - nbugs) = allbugs(i)
  Next

  MSG = "(Doing step 4)"
  For i = 0 To ntotbugs - 1
    MSG = "(Doing step 4.0)"
    Set b = allbugs(i)
    Set b.swarm = Me
    
    MSG = "(Doing step 4.1)"
    b.pos(0) = Math.fRand(maxx)
    b.pos(1) = Math.fRand(maxy)

    MSG = "(Doing step 4.2)"
    b.vel(0) = Math.fRand(targetVel / 2)
    b.vel(1) = Math.fRand(targetVel / 2)

    MSG = _
      "(Doing step 4.3.1) " & vbNewLine & _
      "xsize: " & xsize & vbNewLine & _
      "head: " & head & vbNewLine
    b.hist(head, 0) = b.pos(0) * xsize
    MSG = _
      "(Doing step 4.3.2) " & vbNewLine & _
      "xsize: " & xsize & vbNewLine & _
      "head: " & head & vbNewLine
    b.hist(head, 1) = b.pos(1) * xsize
  Next
    
  MSG = "(Doing step 5)"
  For i = 0 To nbugs - 1
    Set bugs(i).closest = targets(Math.fRand(ntargets - 1))
  Next
  
  Set b = Nothing

Exit Sub
ERROR_initBugs:
  ReportError Me.ProgClass & ".initBugs " & MSG
End Sub
'/*** initBugs ***************************************************************/



'/*** InitCMap *****************************************************************
' *
' *****************************************************************************/
Private Sub initCMap()
  On Error GoTo ERROR_initCMap
  Dim i As Long
  Dim n As Long
  Dim temp As Long

  n = 0

  '/* color 0 is black */
  colors(n) = RGB(0, 0, 0): n = n + 1

  '/* color 1 is red */
  colors(n) = RGB(255, 0, 0): n = n + 1

  '/* color 2 is green */
  colors(n) = RGB(0, 255, 0): n = n + 1

  '/* color 3 is blue */
  colors(n) = RGB(0, 0, 255): n = n + 1

  '/* start greyscale colors at 4; 16 levels */
  For i = 0 To 15
    temp = i * 16
    If (temp > 255) Then
      temp = 255
    End If
    temp = 255 - temp
    colors(n) = RGB(temp, temp, temp): n = n + 1
  Next

  '/* start red fade at 20; 16 levels */
  For i = 0 To 15
    temp = i * 16
    If (temp > 255) Then
      temp = 255
    End If
    colors(n) = RGB(255 - temp, 255 - ((i / 16 + 0.001) ^ 0.3) * 255, colors(n) = 65 - temp / 4): n = n + 1
  Next

  '/* start blue fade at 36; 16 levels */
  For i = 0 To 15
    temp = i * 16
    If (temp > 255) Then
      temp = 255
    End If
    colors(n) = RGB(Math.WrapByte(32 - temp), Math.WrapByte(180 - ((i / 16 + 0.001) ^ 0.3) * 180), Math.WrapByte(255 - temp)): n = n + 1
  Next

  '/* random colors start at 52 */
  numRandomColors = MAX_TRAIL_LEN

  colors(n) = RGB(Math.WrapByte(Rnd() And 255), Math.WrapByte(Rnd() And 255), Math.WrapByte(colors(n - 2) / 2 + colors(n - 3) / 2)): n = n + 1

  For i = 0 To numRandomColors - 1
    colors(n) = RGB(Math.WrapByte((colors(n - 3) + (Math.fRand And 31) - 16) And 255), Math.WrapByte((colors(n - 3) + (Math.fRand And 31) - 16) And 255), colors(n) = Math.WrapByte(colors(n - 2) / (i + 2) + colors(n - 3) / (i + 2))): n = n + 1
  Next

  numColors = n
  
Exit Sub
ERROR_initCMap:
  ReportError Me.ProgClass & ".initCMap"
End Sub
'/*** InitCMap ****************************************************************/



'/*** initGraphics ************************************************************
'*
'*****************************************************************************/
Private Function initGraphics() As Boolean
  On Error GoTo ERROR_initGraphics
  
  Dim MSG As String
  
  MSG = "(Doing initCMap)"
  initCMap

  MSG = "(Doing xsize)"
  With Screen
    xsize = .Width / .TwipsPerPixelX
    ysize = .Height / .TwipsPerPixelY
  End With

  xc = xsize / 2
  yc = ysize / 2

  MSG = "(Doing maxx/y)"
  maxx = 1
  maxy = CDbl(ysize) / CDbl(xsize)

  MSG = "(Doing colorscheme)"
  If (colorScheme < 0) Then
    colorScheme = Math.fRand(NUM_SCHEMES - 1)
  End If

  initGraphics = True
  
Exit Function
ERROR_initGraphics:
  ReportError Me.ProgClass & ".initGraphics " & MSG
End Function
'*** initGraphics *************************************************************



'*** mutateBug ****************************************************************
'*
'******************************************************************************
Public Sub mutateBug(which As Long)
  On Error GoTo ERROR_mutateBug
  Dim i As Long
  Dim j As Long
  Dim b As bug

  If (which = 0) Then
    '/* turn bug into target */
    If (ntargets < MAX_TARGETS - 1 And nbugs > ntargets) Then
      i = Math.fRand(nbugs - 1)
      Set targets(ntargets) = bugs(i)
      Set bugs(i) = bugs(nbugs - 1)
      Set targets(ntargets).closest = Nothing
      nbugs = nbugs - 1
      ntargets = ntargets + 1

      For i = 0 To Fix(nbugs / ntargets) - 1
        'debug.Print (i Mod nbugs)
        Set bugs(i Mod nbugs).closest = targets(ntargets - 1)
      Next
    End If
  Else
    '/* turn target into bug */
    If (ntargets > 2 And nbugs < MAX_BUGS - 1) Then
      '/* pick a target */
      i = Rnd() * (ntargets - 1)
      
      '/* copy state into a new bug */
      Set bugs(nbugs) = targets(i)
      Set targets(i) = targets(ntargets - 1)
      Set targets(ntargets - 1) = Nothing
      ntargets = ntargets - 1
      nbugs = nbugs + 1
      
      '/* pick a target for the new bug */
      Set bugs(nbugs - 1).closest = targets(Fix(Rnd() * (ntargets - 1)))
      
      For j = 0 To nbugs - 1
        '******
        '* safety check
        '* shouldn't need the "is nothing" but I had a bug I couldn't find
        '* fixed now?
        '******
        If (bugs(j).closest Is Nothing Or bugs(j).closest Is bugs(nbugs - 1)) Then
          Set bugs(j).closest = targets(Rnd() * (ntargets - 1))
        End If
      Next

    End If
  End If
Exit Sub
ERROR_mutateBug:
  ReportError Me.ProgClass & ".mutateBug"
End Sub
'*** mutateBug ****************************************************************



'**** mutateParam *************************************************************
'* Modifies a parameter by a random, incremental amount. This means that it
'* changes by a random amount, but no more than 25% either way. For example,
'* if the value was 100 it could end up being any value between 75 and 125.
'******************************************************************************
Private Static Sub mutateParam(ByRef Param As Double)
  On Error GoTo ERROR_mutateParam
  
  Const mutateRate As Double = 0.25
  Param = Param * (1 - mutateRate + Math.fRand(mutateRate * 2))
  
Exit Sub
ERROR_mutateParam:
  ReportError Me.ProgClass & ".mutateParam"
End Sub
'*** mutateParam **************************************************************



'*** pickNewTargets ***********************************************************
'* This cycles through all of the bugs and sets them to a new, random,
'* target. Currently this is favouring one bug.
'******************************************************************************
Private Sub pickNewTargets()
  On Error GoTo ERROR_pickNewTargets
  Dim i As Long

  For i = 0 To nbugs - 1
    'Set bugs(i).closest = targets(Math.fRand(ntargets - 1))
    Set bugs(i).closest = targets(i Mod ntargets)
  Next
  
Exit Sub
ERROR_pickNewTargets:
  ReportError Me.ProgClass & ".pickNewTargets"
End Sub
'*** pickNewTargets ***********************************************************



'*** randomSmallChange ********************************************************
'*
'******************************************************************************
Private Static Sub randomSmallChange()
  On Error GoTo ERROR_randomSmallChange
  Dim whichcase As Long
  Dim callDepth As Long
  DoEvents
  
  callDepth = callDepth + 1
  If (callDepth > 10) Then
    callDepth = callDepth - 1
    Exit Sub
  End If

  whichcase = Rnd() * 11

  Select Case whichcase
    Case 0    '/* acceleration */
      mutateParam maxAcc

    Case 1    '/* target acceleration */
      mutateParam targetAcc

    Case 2    '/* velocity */
      mutateParam maxVel

    Case 3    '/* target velocity */
      mutateParam targetVel

    Case 4    '/* noise */
      mutateParam noise

    Case 5    '/* minVelMultiplier */
      mutateParam minVelMultiplier

    Case 6    '/* target to bug */
      mutateBug 1
    
    Case 7    '/* target to bug */
      mutateBug 1

    Case 8    '/* bug to target */
      mutateBug 0
      
    Case 9    '/* bug to target */
      mutateBug 0
      
    Case 10    '/* color scheme */
      colorScheme = Math.fRand(NUM_SCHEMES - 1)
      If (colorScheme = RANDOM_SCHIZO Or colorScheme = COLOR_SCHIZO) Then
        colorScheme = Math.fRand(NUM_SCHEMES - 1)
      End If

    Case Else
      randomSmallChange
      randomSmallChange
      randomSmallChange
      randomSmallChange
  End Select

  If (minVelMultiplier < 0.3) Then
    minVelMultiplier = 0.3
  End If
  If (minVelMultiplier > 0.9) Then
    minVelMultiplier = 0.9
  End If
  If (noise < 0.01) Then noise = 0.01
  If (maxVel < 0.02) Then maxVel = 0.02
  If (targetVel < 0.02) Then targetVel = 0.02
  If (targetAcc > targetVel * 0.7) Then targetAcc = targetVel * 0.7
  If (maxAcc > maxVel * 0.7) Then maxAcc = maxVel * 0.7
  If (targetAcc > targetVel * 0.7) Then targetAcc = targetVel * 0.7
  If (maxAcc < 0.01) Then maxAcc = 0.01
  If (targetAcc < 0.005) Then targetAcc = 0.005

  computeConstants
  callDepth = callDepth - 1
  
Exit Sub
ERROR_randomSmallChange:
  ReportError Me.ProgClass & ".randomSmallChange"
End Sub
'*** randomSmallChange ********************************************************



'*** randomBigChange **********************************************************
'*
'******************************************************************************
Private Static Sub randomBigChange()
  On Error GoTo ERROR_randomBigChange
  Dim whichcase As Long
  Dim callDepth As Long
  Dim temp As Long

  whichcase = Rnd() * 4

  callDepth = callDepth + 1
  If (callDepth > 3) Then
    callDepth = callDepth - 1
    Exit Sub
  End If

  Select Case (whichcase)
    Case 0:
      '/* trail length */
      temp = (Rnd() * (MAX_TRAIL_LEN - 25)) + 25
      clearBugs
      trailLen = temp
      computeColorIndices
      initBugs

    Case 1:
      '/* Whee! */
      randomSmallChange
      randomSmallChange
      randomSmallChange
      randomSmallChange
      randomSmallChange
      randomSmallChange
      randomSmallChange
      randomSmallChange

    Case 2:
      clearBugs
      initBugs

    Case 3:
      pickNewTargets

    Case Else:
      temp = Math.fRand(ntargets - 1)
      targets(temp).pos(0) = targets(temp).pos(0) + (Math.fRand(maxx / 4) - maxx / 8)
      targets(temp).pos(1) = targets(temp).pos(1) + (Math.fRand(maxy / 4) - maxy / 8)
      '/* updateState() will fix bounds */
      'updateState 'will fix bounds
  End Select

  callDepth = callDepth - 1
Exit Sub
ERROR_randomBigChange:
  ReportError Me.ProgClass & ".randomBigChange"
End Sub
'*** randomBigChange **********************************************************



'*** screenhack ***************************************************************
'*
'******************************************************************************
Public Sub screenhack(ByRef w As Form)
  On Error GoTo ERROR_screenhack
  Dim nframes As Long
  Dim i As Long
  Dim fps As Double
  Dim timePerFrame As Double
  Dim elapsed As Double
  Dim targetColorIndex() As Long
  Dim colorIndex() As Long
  Dim targetStartColor As Long
  Dim targetNumColors As Long
  Dim startColor As Long
  Dim numColors As Long
  Dim sTime As Double
  Dim eTime As Double
  Dim cnt As Long
  Dim sleepCount As Long:  sleepCount = 0
  Dim delayAccum As Long:  delayAccum = 0

  initVar
  
  If (w Is Nothing) Then
    Err.Raise -2000000, Me.ProgClass & ".screenhack", "No Form received to draw on."
  End If
  Set win = Nothing
  Set win = w

  If (Not initGraphics()) Then
    Exit Sub
  End If

  computeConstants
  initBugs
  computeColorIndices

  If (changeProb > 0) Then
    For i = (Rnd() * 5) + 5 To 0 Step -1
      randomSmallChange
    Next
  End If

  nframes = 0
  sTime = Now()
  
  While (sleepCount <= 2 And Continue)
    DoEvents
    If (delay > 0) Then
      cnt = 2
      dt = DESIRED_DT / 2
    Else
      cnt = 1
      dt = DESIRED_DT
    End If

    For cnt = cnt To 1 Step -1
      updateState
      updateColorIndex targetColorIndex, targetStartColor, targetNumColors, colorIndex, startColor, numColors
      drawBugs targetColorIndex, targetStartColor, targetNumColors, colorIndex, startColor, numColors
      'win.Refresh
      DoEvents
      If (Not Continue) Then
        Exit For
      End If
    Next
    eTime = Now()
    nframes = nframes + 1

    If (CDate(eTime) > DateAdd("s", 0.5, sTime)) Then
      If (Math.fRand(1) < changeProb) Then
        randomSmallChange
      End If
      If (Math.fRand(1) < changeProb * 0.3) Then
        randomBigChange
      End If
      
      elapsed = eTime - sTime

      timePerFrame = elapsed / nframes - delay * 0.000001
      fps = nframes / elapsed
      'debug.Print ("elapsed: " & elapsed)
      'debug.Print ("secs per frame: " & timePerFrame)
      'debug.Print ("delay: " & delay)

      If (fps > MAX_FPS) Then
        delay = (1 / MAX_FPS - (timePerFrame + delay * 0.000001)) * 1000000
        
      ElseIf (dt * fps < MIN_FPS * DESIRED_DT) Then
        '/* need to speed things up somehow */
        If (nbugs > 10) Then 'always evaluate to false?
          '/*printf("reducing bugs to improve speed.\n");*/
          nbugs = nbugs * fps / MIN_FPS
          If (ntargets >= nbugs / 2) Then
            mutateBug 1
          End If
          clearBugs
        ElseIf (0 And dt < 0.3) Then
          ''debug.Print "increasing dt to improve speed."
          dt = dt * MIN_FPS / fps
          computeConstants
          
       ElseIf (trailLen > 10) Then
         clearBugs
         trailLen = trailLen * (fps / MIN_FPS)
         If (trailLen < 10) Then
           trailLen = 10
         End If
         computeColorIndices
         initBugs
      End If
    End If

    sTime = Now()
    nframes = 0
  End If

  Sleep (10)
  If (delay > 10000) Then
    'Sleep (delay)
  Else
    delayAccum = delayAccum + delay
    If (delayAccum > 10000) Then
      delayAccum = 0
      sleepCount = 0
    End If
    sleepCount = sleepCount + 1
    If (sleepCount > 2) Then
        sleepCount = 0
    End If
  End If
  If (win Is Nothing) Then
    sleepCount = 100
  ElseIf (Not win.Visible) Then
    sleepCount = 100
  End If
Wend
Exit Sub
ERROR_screenhack:
  ReportError Me.ProgClass & ".screenhack"
End Sub
'*** screenhack ***************************************************************



'/*** updateState *************************************************************
'*
'*****************************************************************************/
Public Sub updateState()
  On Error GoTo ERROR_updateState
  
  Dim i As Long
  Dim b As bug
  Dim ax As Double
  Dim ay As Double
  Dim temp As Double
  Dim theta As Double
  Static checkIndex As Long
  
  Dim b2 As bug
  Dim j As Long

  head = (head + 1) Mod trailLen

  For j = 0 To nbugs - 1
    '/* update closets bug for the bug indicated by checkIndex */
    Set b = bugs(checkIndex)

    ax = b.closest.pos(0) - b.pos(0)
    ay = b.closest.pos(1) - b.pos(1)
    temp = Math.sq(ax) + Math.sq(ay)
    For i = 0 To ntargets - 1
      Set b2 = targets(i)
      If Not (b2 Is b.closest) Then
        ax = b2.pos(0) - b.pos(0)
        ay = b2.pos(1) - b.pos(1)
        theta = Math.sq(ax) + Math.sq(ay)
        If (theta * 2 < temp) Then
          Set b.closest = b2
          temp = theta
        End If
      End If
    Next
    checkIndex = (checkIndex + 1) Mod nbugs
  Next

  '/* update target state */
  For i = 0 To ntargets - 1
  
    Set b = targets(i)
    theta = Math.fRand(Math.PI * 2)
    ax = targetAcc * Cos(theta)
    ay = targetAcc * Sin(theta)
    
    b.vel(0) = b.vel(0) + ax * dt
    b.vel(1) = b.vel(1) + ay * dt

    '/* check velocity */
    temp = Math.sq(b.vel(0)) + Math.sq(b.vel(1))
    If (temp > targetVelSq) Then
      temp = targetVel / Math.sqrt(temp)
      '/* save old vel for acc computation */
      ax = b.vel(0)
      ay = b.vel(1)

      '/* compute new velocity */
      b.vel(0) = b.vel(0) * temp
      b.vel(1) = b.vel(1) * temp

      '/* update acceleration */
      ax = (b.vel(0) - ax) * dtInv
      ay = (b.vel(1) - ay) * dtInv
    End If

    '/* update position */
    b.pos(0) = b.pos(0) + (b.vel(0) * dt + ax * halfDtSq)
    b.pos(1) = b.pos(1) + (b.vel(1) * dt + ay * halfDtSq)

    '/* check limits on targets */
    If (b.pos(0) < 0) Then
      '/* bounce */
      b.pos(0) = -1 * b.pos(0)
      b.vel(0) = -1 * b.vel(0)
    ElseIf (b.pos(0) >= maxx) Then
      '/* bounce */
      b.pos(0) = 2 * maxx - b.pos(0)
      b.vel(0) = -1 * b.vel(0)
    End If
    If (b.pos(1) < 0) Then
      '/* bounce */
      b.pos(1) = -1 * b.pos(1)
      b.vel(1) = -1 * b.vel(1)
    ElseIf (b.pos(1) >= maxy) Then
      '/* bounce */
      b.pos(1) = 2 * maxy - b.pos(1)
      b.vel(1) = -1 * b.vel(1)
    End If

    b.hist(head, 0) = b.pos(0) * xsize
    b.hist(head, 1) = b.pos(1) * xsize
  Next

  '/* update bug state */
  For i = 0 To nbugs - 1
  
    Set b = bugs(i)
    
    theta = Math.atan(b.closest.pos(1) - b.pos(1) + Math.fRand(noise) - (noise / 2), b.closest.pos(0) - b.pos(0) + Math.fRand(noise) - (noise / 2))
    ax = maxAcc * Cos(theta)
    ay = maxAcc * Sin(theta)

    b.vel(0) = b.vel(0) + ax * dt
    b.vel(1) = b.vel(1) + ay * dt

    '/* check velocity */
    temp = Math.sq(b.vel(0)) + Math.sq(b.vel(1))
    If (temp > maxVelSq) Then
      temp = maxVel / Math.sqrt(temp)

      '/* save old vel for acc computation */
      ax = b.vel(0)
      ay = b.vel(1)

      '/* compute new velocity */
      b.vel(0) = b.vel(0) * temp
      b.vel(1) = b.vel(1) * temp

      '/* update acceleration */
      ax = (b.vel(0) - ax) * dtInv
      ay = (b.vel(1) - ay) * dtInv
      
    ElseIf (temp < minVelSq) Then
      temp = minVel / Math.sqrt(temp)

      '/* save old vel for acc computation */
      ax = b.vel(0)
      ay = b.vel(1)

      '/* compute new velocity */
      b.vel(0) = b.vel(0) * temp
      b.vel(1) = b.vel(1) * temp

      '/* update acceleration */
      ax = (b.vel(0) - ax) * dtInv
      ay = (b.vel(1) - ay) * dtInv
    End If

    '/* update position */
    b.pos(0) = b.pos(0) + (b.vel(0) * dt + ax * halfDtSq)
    b.pos(1) = b.pos(1) + (b.vel(1) * dt + ay * halfDtSq)

    b.hist(head, 0) = b.pos(0) * xsize
    b.hist(head, 1) = b.pos(1) * xsize
  Next
  
  
  Set b = Nothing
  Set b2 = Nothing
  
'temporary until I can find the overrun error
Exit Sub
ERROR_updateState:
  ReportError Me.ProgClass & ".updatestate"
End Sub
'*** updateState **************************************************************



'*** updateColorIndex *********************************************************
'*
'******************************************************************************
Private Sub updateColorIndex(ByRef tColorIdx() As Long, ByRef tci0 As Long, ByRef tnc As Long, ByRef colorIdx() As Long, ByRef ci0 As Long, ByRef nc As Long)
  On Error GoTo ERROR_updateColorIndex
  Select Case colorScheme
    Case COLOR_TRAILS:
      tColorIdx = redIndex
      tci0 = 0
      tnc = trailLen
      colorIdx = blueIndex
      ci0 = 0
      nc = trailLen

    Case GRAY_SCHIZO:
      tColorIdx = graySIndex
      tci0 = head
      tnc = trailLen
      colorIdx = graySIndex
      ci0 = head
      nc = trailLen

    Case COLOR_SCHIZO:
      tColorIdx = redSIndex
      tci0 = head
      tnc = trailLen
      colorIdx = blueSIndex
      ci0 = head
      nc = trailLen

    Case GRAY_TRAILS:
      tColorIdx = grayIndex
      tci0 = 0
      tnc = trailLen
      colorIdx = grayIndex
      ci0 = 0
      nc = trailLen

    Case RANDOM_TRAILS:
      tColorIdx = redIndex
      tci0 = 0
      tnc = trailLen
      colorIdx = randomIndex
      ci0 = 0
      nc = trailLen

    Case RANDOM_SCHIZO:
      tColorIdx = redIndex
      tci0 = head
      tnc = trailLen
      colorIdx = randomIndex
      ci0 = head
      nc = trailLen
  End Select
Exit Sub
ERROR_updateColorIndex:
  ReportError Me.ProgClass & ".updateColorIndex"
End Sub
'*** updateColorIndex *********************************************************



'*** Class_Initialize *********************************************************
'*
'******************************************************************************
Private Sub Class_Initialize()
  On Error GoTo ERROR_Class_Initialize
  Randomize
  
  Set Math = New miscMath
  Set good1 = New bugParams
  Set Params = New Scripting.Dictionary
  
  Continue = True
  
  CreateParams
  
Exit Sub
ERROR_Class_Initialize:
  ReportError Me.ProgClass & ".init"
End Sub
'*** Class_Initialize *********************************************************



'*** Class_Terminate **********************************************************
'*
'******************************************************************************
Private Sub Class_Terminate()
  On Error GoTo ERROR_Class_Terminate
  Dim i As Long
  
  If Not (win Is Nothing) Then
    Set win = Nothing
  End If
  
  For i = 0 To ntotbugs - 1
    Set allbugs(i) = Nothing
  Next
  
  For i = 0 To nbugs - 1
    Set bugs(i) = Nothing
  Next
  
  For i = 0 To ntargets - 1
    Set targets(i) = Nothing
  Next
  
  Set good1 = Nothing
  Set Math = Nothing
  
Exit Sub
ERROR_Class_Terminate:
  ReportError Me.ProgClass & ".terminate"
End Sub
'*** Class_Terminate **********************************************************



'*** CreateParams *************************************************************
'*
'******************************************************************************
Private Function CreateParams() As Boolean
  Dim p As Param

  CreateParams = False
  
  Set p = New Param
  With p
    Params.Add "cls", .Create(typeINT, 0, 1, 1)
    Params.Add "fps", .Create(typeFLT, 16, 150, 150)
    Params.Add "TrailLen", .Create(typeINT, 5, 60, 40)
    Params.Add "Bugs", .Create(typeINT, 2, 100, 50)
    Params.Add "Targets", .Create(typeINT, 2, 5, 5)
    Params.Add "vel", .Create(typeFLT, 0, 1, 0.03)
  End With
  Set p = Nothing
  
  CreateParams = True
End Function
'*** CreateParams *************************************************************

