VERSION 5.00
Begin VB.Form frmMain 
   BorderStyle     =   0  'None
   ClientHeight    =   2790
   ClientLeft      =   5640
   ClientTop       =   2205
   ClientWidth     =   4440
   ClipControls    =   0   'False
   ControlBox      =   0   'False
   Icon            =   "frmMain.frx":0000
   KeyPreview      =   -1  'True
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   Moveable        =   0   'False
   NegotiateMenus  =   0   'False
   ScaleHeight     =   186
   ScaleMode       =   3  'Pixel
   ScaleWidth      =   296
   ShowInTaskbar   =   0   'False
   WindowState     =   2  'Maximized
End
Attribute VB_Name = "frmMain"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
'*****************************************************************************
'* $Id: frmMain.frm 17 2004-04-15 22:33:33Z jeff.cave $
'*****************************************************************************
Option Explicit



Private pDrawClass As Object ' engine.



'*** set DrawClass ***********************************************************
'*
'*****************************************************************************
Public Property Set DrawClass(ByRef newDraw As Object)
  If Not (pDrawClass Is Nothing) Then
    pDrawClass.Continue = False
  End If
  Set pDrawClass = newDraw
  If Not (pDrawClass Is Nothing) Then
    pDrawClass.Continue = True
  End If
End Property
'*** set DrawClass ***********************************************************



'*** Form_Load ***************************************************************
'*
'*****************************************************************************
Private Sub Form_Load()
Dim l         As Long
Dim ScaleSize As Single
  
  ' Get the screen saver's settings from the registry.
  pLoadSettings
  ' Initialize the desktop image information.
  pInitDeskDC glDeskDC, gDeskBmp, gDispRec
  ' See if a screen saver password is used.
  'Call fReadValue("HKCU", "Control Panel\Desktop", "ScreenSaveUsePassword", "D", False, gbUsePassword)
End Sub
'*** Form_Load ***************************************************************


Private Sub Form_Click()
  pRespond
End Sub
Private Sub Form_DblClick()
  pRespond
End Sub
Private Sub Form_KeyDown(KeyCode As Integer, Shift As Integer)
  pRespond
End Sub
Private Sub Form_KeyPress(KeyAscii As Integer)
  pRespond
End Sub
Private Sub Form_MouseDown(Button As Integer, Shift As Integer, x As Single, y As Single)
  pRespond
End Sub

'*** Form_MouseMove ***********************************************************
'*
'******************************************************************************
Private Sub Form_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)
  Static ClickCount As Long
  '
  ' Besides firing when the mouse moves, this event is
  ' also fired when the form is first loaded and sized.
  ' This code prevents the screen saver from unloading
  ' under the wrong circumstances.
  '
  If ClickCount > 2 Then
      pRespond
  End If
  ClickCount = ClickCount + 1
End Sub
'*** Form_MouseMove ***********************************************************



'*** Form_Paint **************************************************************
'*
'* Repaint the desktop bitmap to the form.
'*
'*****************************************************************************
Private Sub Form_Paint()
  pPaintDeskDC glDeskDC, gDeskBmp, hwnd
End Sub
'*** Form_Paint **************************************************************



'*** Form_Unload *************************************************************
'*
'*****************************************************************************
Private Sub Form_Unload(Cancel As Integer)
  Dim l As Integer

  ' Clean up the Desktop device context to prevent memory leaks.
  Call DeleteDC(glDeskDC)

  ' Show the MousePointer
  If (glRunMode = RM_NORMAL) Then
    ShowCursor True
  End If
  Screen.MousePointer = vbDefault
  
  Set pDrawClass = Nothing
  Set frmMain = Nothing
End Sub
'*** Form_Unload *************************************************************




'*** pRespond ****************************************************************
'*
'*****************************************************************************
Public Sub pRespond()
  Dim lPrev As Long
  
  If glRunMode <> RM_NORMAL Then
    Exit Sub
  End If
  
  pDrawClass.Continue = False
  
  ' Stop the screen saver from being the top most window.
  ShowCursor True
  SetWindowPos Me.hwnd, HWND_NOTOPMOST, 0&, 0&, 0, 0, SWP_NOSIZE
  
End Sub
'*** pRespond ****************************************************************





