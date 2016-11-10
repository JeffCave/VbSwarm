Attribute VB_Name = "basMain"
'*****************************************************************************
'* $Id: basMain.bas 17 2004-04-15 22:33:33Z jeff.cave $
'*****************************************************************************
Option Explicit


Public engine As clsSwarm


'----------------------------------------------------------------------
' Public Variables.
'----------------------------------------------------------------------
Public glDisplayHwnd As Long          ' Handle of Preview window.
Public glRunMode     As Long          ' Screen saver running mode (run, preview, setup)
Public glDeskDC      As Long          ' Desktop device context handle.
Public gDispRec      As RECT          ' Rectangle values of Preview window.
Public gDeskBmp      As BITMAP        ' Bitmap copy of the desktop.

'----------------------------------------------------------------------
' Application Specific Constants.
'----------------------------------------------------------------------
Public Const cPREVIEW_WINDOW = "Display Properties"
Public Const cREGKEY = "Software\Vius\Swarm"

' ScreenSaver Running Modes.
Public Const RM_NORMAL = 1
Public Const RM_CONFIGURE = 2
Public Const RM_PREVIEW = 4

'----------------------------------------------------------------------
'Public API Declares.
'----------------------------------------------------------------------
Public Declare Function FindWindow Lib "user32" Alias "FindWindowA" (ByVal lpClassName As String, ByVal lpWindowName As String) As Long
Public Declare Function SystemParametersInfo Lib "user32" Alias "SystemParametersInfoA" (ByVal uAction As Long, ByVal uParam As Long, ByRef lpvParam As Any, ByVal fuWinIni As Long) As Long
Public Declare Function CallWindowProc Lib "user32" Alias "CallWindowProcA" (ByVal lpPrevWndFunc As Long, ByVal hwnd As Long, ByVal MSG As Long, ByVal wParam As Long, ByVal lParam As Long) As Long
Public Declare Function DeleteObject Lib "gdi32" (ByVal hObject As Long) As Long
Public Declare Function GetDesktopWindow Lib "user32" () As Long
Public Declare Function GetClientRect Lib "user32" (ByVal hwnd As Long, lpRect As RECT) As Long
Public Declare Function GetWindowRect Lib "user32" (ByVal hwnd As Long, lpRect As RECT) As Long
Public Declare Function GetObject Lib "gdi32" Alias "GetObjectA" (ByVal hObject As Long, ByVal nCount As Long, lpObject As Any) As Long
Public Declare Function GetMapMode Lib "gdi32" (ByVal hdc As Long) As Long
Public Declare Function SelectObject Lib "gdi32" (ByVal hdc As Long, ByVal hObject As Long) As Long
Public Declare Function SetWindowLong Lib "user32" Alias "SetWindowLongA" (ByVal hwnd As Long, ByVal nIndex As Long, ByVal dwNewLong As Long) As Long
Public Declare Function SendMessage Lib "user32" Alias "SendMessageA" (ByVal hwnd As Long, ByVal wMsg As Long, ByVal wParam As Long, lParam As Long) As Long
Public Declare Function SetMapMode Lib "gdi32" (ByVal hdc As Long, ByVal nMapMode As Long) As Long
Public Declare Sub SetWindowPos Lib "user32" (ByVal hwnd As Long, ByVal hWndInsertAfter As Long, ByVal x As Long, ByVal y As Long, ByVal cx As Long, ByVal cy As Long, ByVal wFlags As Long)
Public Declare Function SetParent Lib "user32" (ByVal hWndChild As Long, ByVal hWndNewParent As Long) As Long
Public Declare Function SetBkColor Lib "gdi32" (ByVal hdc As Long, ByVal crColor As Long) As Long
Public Declare Function ShellAbout Lib "shell32.dll" Alias "ShellAboutA" (ByVal hwnd As Long, ByVal szApp As String, ByVal szOtherStuff As String, ByVal hIcon As Long) As Long
Public Declare Function ShowCursor Lib "user32" (ByVal fShow As Integer) As Integer
Public Declare Function ShowWindow Lib "user32" (ByVal hwnd As Long, ByVal nCmdShow As Long) As Long
Public Declare Function StretchBlt Lib "gdi32" (ByVal hdc As Long, ByVal x As Long, ByVal y As Long, ByVal nWidth As Long, ByVal nHeight As Long, ByVal hSrcDC As Long, ByVal xSrc As Long, ByVal ySrc As Long, ByVal nSrcWidth As Long, ByVal nSrcHeight As Long, ByVal dwRop As Long) As Long
Public Declare Function BitBlt Lib "gdi32" (ByVal hDestDC As Long, ByVal x As Long, ByVal y As Long, ByVal nWidth As Long, ByVal nHeight As Long, ByVal hSrcDC As Long, ByVal xSrc As Long, ByVal ySrc As Long, ByVal dwRop As Long) As Long
Public Declare Function CreateBitmap Lib "gdi32" (ByVal nWidth As Long, ByVal nHeight As Long, ByVal nPlanes As Long, ByVal nBitCount As Long, lpBits As Any) As Long
Public Declare Function CreateCompatibleBitmap Lib "gdi32" (ByVal hdc As Long, ByVal nWidth As Long, ByVal nHeight As Long) As Long
Public Declare Function CreateBitmapIndirect Lib "gdi32" (lpBitmap As Any) As Long
Public Declare Function CreateIC Lib "gdi32" Alias "CreateICA" (ByVal lpDriverName As String, ByVal lpDeviceName As String, ByVal lpOutput As String, ByVal lpInitData As String) As Long
Public Declare Function CreateCompatibleDC Lib "gdi32" (ByVal hdc As Long) As Long
Public Declare Function DeleteDC Lib "gdi32" (ByVal hdc As Long) As Long
Public Declare Function GetDC Lib "user32" (ByVal hwnd As Long) As Long
Public Declare Function GetWindowDC Lib "user32" (ByVal hwnd As Long) As Long
Public Declare Function ReleaseDC Lib "user32" (ByVal hwnd As Long, ByVal hdc As Long) As Long
Public Declare Function GetWindowLong Lib "user32" Alias "GetWindowLongA" (ByVal hwnd As Long, ByVal nIndex As Long) As Long

'----------------------------------------------------------------------
'Public Constants.
'----------------------------------------------------------------------
Public Const WS_CHILD       As Long = &H40000000
Public Const GWL_HWNDPARENT As Long = (-8)
Public Const GWL_STYLE      As Long = (-16)

Public Const SPI_SCREENSAVERRUNNING As Long = 97

Public Const HWND_TOPMOST   As Long = -1&
Public Const HWND_TOP       As Long = 0&
Public Const HWND_BOTTOM    As Long = 1&
Public Const HWND_NOTOPMOST As Long = -2

Public Const SWP_NOSIZE        As Long = &H1&
Public Const SWP_NOMOVE        As Long = &H2
Public Const SWP_NOZORDER      As Long = &H4
Public Const SWP_NOREDRAW      As Long = &H8
Public Const SWP_NOACTIVATE    As Long = &H10
Public Const SWP_FRAMECHANGED  As Long = &H20
Public Const SWP_SHOWWINDOW    As Long = &H40
Public Const SWP_HIDEWINDOW    As Long = &H80
Public Const SWP_NOCOPYBITS    As Long = &H100
Public Const SWP_NOOWNERZORDER As Long = &H200
Public Const SWP_DRAWFRAME     As Long = SWP_FRAMECHANGED
Public Const SWP_NOREPOSITION  As Long = SWP_NOOWNERZORDER

' Windows messages.
Public Const WM_PAINT          As Long = &HF&
Public Const WM_ACTIVATEAPP    As Long = &H1C&
Public Const SW_SHOWNOACTIVATE As Long = 4&

' Get Windows Long Constants.
Public Const GWL_USERDATA As Long = (-21&)
Public Const GWL_WNDPROC  As Long = (-4&)

'----------------------------------------------------------------------
'Public Type Defs.
'----------------------------------------------------------------------
'*** Main ********************************************************************
'*
'*****************************************************************************
Public Sub Main()
  DetermineState
End Sub
'*** Main ********************************************************************



'*** fShrinkBMP **************************************************************
' Scale a bitmap by an X and Y percentage and
' return a handle to the new bitmap.
'*****************************************************************************
Public Function fShrinkBMP(dispHdc As Long, hBmp As Long, RatioX As Single, RatioY As Single) As Long
  Dim hBmpOut As Long   ' Output bitmap handle.
  Dim hdcMem1 As Long   ' Temporary memory bitmap handles.
  Dim hdcMem2 As Long
  Dim bm1     As BITMAP ' Temporary bitmap structures.
  Dim bm2     As BITMAP

  ' Create memory DCs compatible to the display DC.
  hdcMem1 = CreateCompatibleDC(dispHdc)
  hdcMem2 = CreateCompatibleDC(dispHdc)

  ' Get the bitmap information and save it in bm1.
  GetObject hBmp, LenB(bm1), bm1

  ' Copy bitmap 1 to bitmap 2.
  LSet bm2 = bm1

  ' Scale output bitmap width and height.
  ' Calculate bitmap width bytes.
  With bm2
    .bmWidth = CLng(.bmWidth * RatioX)
    .bmHeight = CLng(.bmHeight * RatioY)
    .bmWidthBytes = ((((.bmWidth * .bmBitsPixel) + 15) \ 16) * 2)
  End With

  ' Create a handle to output bitmap indirectly from new bm2.
  hBmpOut = CreateBitmapIndirect(bm2)

' Select original bitmap into the memory dc.
' Select new bitmap into the memory dc.
'
Call SelectObject(hdcMem1, hBmp)
Call SelectObject(hdcMem2, hBmpOut)
'
' Stretch old bitmap into new bitmap.
'
Call StretchBlt(hdcMem2, 0, 0, bm2.bmWidth, bm2.bmHeight, _
        hdcMem1, 0, 0, bm1.bmWidth, bm1.bmHeight, vbSrcCopy)
'
' Delete memory DCs
'
Call DeleteDC(hdcMem1)
Call DeleteDC(hdcMem2)
'
' Return handle to new bitmap
'
fShrinkBMP = hBmpOut
End Function
'*** fShrinkBMP **************************************************************



'*** pInitDeskDC *************************************************************
'* Create and return a bitmap that looks like the current desktop but that is
'* stretched or compressed to a pre-defined width and height as specified by
'* gDispRec.
'*****************************************************************************
Public Sub pInitDeskDC(OutHdc As Long, OutBmp As BITMAP, gDispRec As RECT)
  Dim DskHwnd As Long  ' Handle of desktop window.
  Dim DskHdc  As Long  ' DC handle of desktop window.
  Dim hOutBmp As Long  ' Handle to output bitmap.
  Dim rc      As Long  ' Function return code.
  Dim DskRect As RECT  ' Rect size of desktop.
  '
  ' Get the handle of the desktop window.
  '
  DskHwnd = GetDesktopWindow()
  '
  ' Get the device context (DC) for the entire window,
  ' including title bar, menus, and scroll bars. A window DC
  ' permits painting anywhere in a window, because the origin
  ' of the device context is the upper-left corner of the
  ' window instead of the client area.
  '
  DskHdc = GetWindowDC(DskHwnd)
  '
  ' Get the dimensions of the desktop window.
  '
  rc = GetWindowRect(DskHwnd, DskRect)

  With gDispRec
    '
    ' Create a bitmap compatible with the desktop
    ' window and return its handle. The dimensions
    ' are 1 pixel wider and taller than the desktop
    ' window.
    '
    hOutBmp = CreateCompatibleBitmap(DskHdc, (.Right - .Left + 1), (.Bottom - .Top + 1))
    '
    ' Fill the output bitmap's structure with
    ' the width, height and color information
    ' of the newly created bitmap.
    '
    rc = GetObject(hOutBmp, Len(OutBmp), OutBmp)
    '
    ' Create a memory DC compatible with the
    ' desktop window DC. The new memory DC's
    ' display surface is one monochrome pixel
    ' wide and one monochrome pixel high.
    '
    OutHdc = CreateCompatibleDC(DskHdc)
    
    ' Copy the desktop compatible bitmap (hOutBmp)
    ' into the output/memory DC (OutHdc). rc is the
    ' handle of the replaced the existing DC.
    rc = SelectObject(OutHdc, hOutBmp)
    
    ' Copy the desktop compatible bitmap to the
    ' output DC streching or compressing it as
    ' required by the specified dimensions.
    rc = StretchBlt(OutHdc, 0, 0, (.Right - .Left + 1), _
            (.Bottom - .Top + 1), DskHdc, 0, 0, _
            (DskRect.Right - DskRect.Left + 1), _
            (DskRect.Bottom - DskRect.Top + 1), _
             vbSrcCopy)

    ' If the clear screen option was selected, set
    ' the output DC to black.
    If (engine.Params.Item("cls").Val = 1) Then
      BitBlt OutHdc, 0, 0, (.Right - .Left + 1), (.Bottom - .Top + 1), DskHdc, 0, 0, vbBlackness
    End If

  End With
  
  ' Delete the output bitmap.
  ' Release the desktop DC.
  rc = DeleteObject(hOutBmp)
  rc = ReleaseDC(DskHwnd, DskHdc)
  
End Sub
'*** pInitDeskDC *************************************************************



'*** pPaintDeskDC ************************************************************
'*
'*****************************************************************************
Public Sub pPaintDeskDC(InHdc As Long, InBmp As BITMAP, OutHwnd As Long)
'
' Paint the picture, specified by InBmp, to the
' output window streching or compressing it as required.
'
Dim OutHdc  As Long   ' Output window DC handle.
Dim rc      As Long   ' Function return code
Dim OutRect As RECT   ' Rectangular size of output window.
'
' Get the dimensions of the client area of
' the destination window. Also get the
' destinations window's DC handle.
'
rc = GetClientRect(OutHwnd, OutRect)
OutHdc = GetWindowDC(OutHwnd)
'
' Paint the desktop picture to the output window
' streching or compressing it as required.
'
With OutRect
    rc = StretchBlt(OutHdc, 0, 0, (.Right - .Left + 1), _
        (.Bottom - .Top + 1), InHdc, 0, 0, _
         InBmp.bmWidth, InBmp.bmHeight, vbSrcCopy)
End With
'
' Release the source DC.
'
rc = ReleaseDC(OutHwnd, OutHdc)
End Sub
'*** pPaintDeskDC ************************************************************



'*** pDrawTransparentBitmap **************************************************
'*
'*****************************************************************************
Public Sub pDrawTransparentBitmap(lHDCDest As Long, lBmSource As Long, _
        lMaskColor As Long, Optional lDestStartX As Long, _
        Optional lDestStartY As Long, Optional lDestWidth As Long, _
        Optional lDestHeight As Long, Optional lSrcStartX As Long, _
        Optional lSrcStartY As Long, Optional BkGrndHdc As Long)
'
' Draw the sprite onto the Form.  The background of
' the sprite is made transparent so the form's image
' shows through.
'
Dim lColorRef    As Long 'COLORREF
Dim lBmAndBack   As Long 'HBITMAP
Dim lBmAndObject As Long
Dim lBmAndMem    As Long
Dim lBmSave      As Long
Dim lBmBackOld   As Long
Dim lBmObjectOld As Long
Dim lBmMemOld    As Long
Dim lBmSaveOld   As Long
Dim lHDCMem      As Long 'HDC
Dim lHDCBack     As Long
Dim lHDCObject   As Long
Dim lHDCTemp     As Long
Dim lHDCSave     As Long
Dim x            As Long
Dim y            As Long
Dim udtBitMap    As BITMAP
Dim udtSize      As POINTAPI 'POINT
'
' Create a temporary DC compatible with the
' Destination DC (main form's DC).
'
lHDCTemp = CreateCompatibleDC(lHDCDest)
'
' Select the sprite's bitmap into the temporary DC.
' Store the sprite bitmap's characteristics in
' the udtBitMap.
'
Call SelectObject(lHDCTemp, lBmSource)
Call GetObject(lBmSource, Len(udtBitMap), udtBitMap)
'
' Set the size of the temporary bitmap.
'
With udtSize
    .x = udtBitMap.bmWidth
    .y = udtBitMap.bmHeight
    '
    ' Use the optionally passed in width and height values.
    '
    If lDestWidth <> 0 Then .x = lDestWidth
    If lDestHeight <> 0 Then .y = lDestHeight
    x = .x
    y = .y
End With
'
' Create some DCs compatible with
' the main form to hold temporary data.
'
lHDCBack = CreateCompatibleDC(lHDCDest)
lHDCObject = CreateCompatibleDC(lHDCDest)
lHDCMem = CreateCompatibleDC(lHDCDest)
lHDCSave = CreateCompatibleDC(lHDCDest)
'
' Create a bitmap for each DC.  DCs are required
' for a number of GDI functions.
'
' Monochrome bitmaps.
'
'02/025/2002
'lBmAndBack = CreateBitmap(x, y, 1, 1, 0&)
'lBmAndObject = CreateBitmap(x, y, 1, 1, 0&)
lBmAndBack = CreateBitmap(x, y, 1, 1, ByVal 0&)
lBmAndObject = CreateBitmap(x, y, 1, 1, ByVal 0&)
'
' Color Compatible bitmaps.
'
lBmAndMem = CreateCompatibleBitmap(lHDCDest, x, y)
lBmSave = CreateCompatibleBitmap(lHDCDest, x, y)
'
' Each DC must select a bitmap object to store pixel data.
'
' Monochrome.
'
lBmBackOld = SelectObject(lHDCBack, lBmAndBack)
lBmObjectOld = SelectObject(lHDCObject, lBmAndObject)
'
' Color.
'
lBmMemOld = SelectObject(lHDCMem, lBmAndMem)
lBmSaveOld = SelectObject(lHDCSave, lBmSave)
'
' Set the mapping mode of the temporary (sprite)
' DC to that of the form's DC.  The mapping mode
' defines the unit of measure used to transform
' page-space units into device-space units, and
' also defines the orientation of the device's
' x and y axes.
'
Call SetMapMode(lHDCTemp, GetMapMode(lHDCDest))
'
' Save the sprite bitmap that was passed in
' because it will be overwritten.
'
Call BitBlt(lHDCSave, 0&, 0&, x, y, lHDCTemp, lSrcStartX, lSrcStartY, vbSrcCopy)
'
' Set the background color of the sprite's DC to
' the color in the sprite that should be transparent.
'
' Example:
' The background of our sprite is black. Set the
' background color of the DC to black.
'
lColorRef = SetBkColor(lHDCTemp, lMaskColor)
'
' Create a mask for the sprite by performing a BitBlt from
' the sprite's bitmap to a monochrome bitmap.  The result is
' a matrix of 1's and 0's where 0 represents the foreground
' color and 1 represents the the background color.
'
' Suppose our sprite is a red "X" on a black blackground.
' The mask will contain 0's where the "X" is and 1's
' everywhere else.
'
Call BitBlt(lHDCObject, 0&, 0&, x, y, lHDCTemp, lSrcStartX, lSrcStartY, vbSrcCopy)
'
' Set the background color of the sprite's
' DC back to its original color.
'
Call SetBkColor(lHDCTemp, lColorRef)
'
' Create the inverse of the mask.
'
' In Our Example:
' The mask will have 1's where the "X" is and 0's
' everywhere else representing the black background.
'
Call BitBlt(lHDCBack, 0&, 0&, x, y, lHDCObject, 0&, 0&, vbNotSrcCopy)
'
' Copy the background of the main DC to the destination.
' The lHDCMem is a color version of the desktop image.
'
If (BkGrndHdc = 0) Then
    Call BitBlt(lHDCMem, 0&, 0&, x, y, lHDCDest, lDestStartX, lDestStartY, vbSrcCopy)
Else
    Call BitBlt(lHDCMem, 0&, 0&, x, y, BkGrndHdc, lDestStartX, lDestStartY, vbSrcCopy)
End If
'
' Mask out the places where the bitmap will be placed by AND-ing
' the memory DC with the mask with the 0's where the "X" is.
'
Call BitBlt(lHDCMem, 0&, 0&, x, y, lHDCObject, 0&, 0&, vbSrcAnd)
'
' Mask out the transparent colored pixels on the bitmap. The
' background of the sprite is masked out so only the "X" remains.
' lHDCTemp is the colored sprite.  This is AND-ed with the mask
' which has the 1's where the "X" is and 0's where the background is.
'
Call BitBlt(lHDCTemp, lSrcStartX, lSrcStartY, x, y, lHDCBack, 0&, 0&, vbSrcAnd)
'
' Combine the colored foreground of the sprite with the colored
' desktop image by OR-ing the bitmap in the prior step with
' that from two steps back.
'
Call BitBlt(lHDCMem, 0&, 0&, x, y, lHDCTemp, lSrcStartX, lSrcStartY, vbSrcPaint)
'
' Copy the final combination of desktop bitmap
' and the sprite's foreground to the form.
'
Call BitBlt(lHDCDest, lDestStartX, lDestStartY, x, y, lHDCMem, 0&, 0&, vbSrcCopy)
'
' Place the original sprite bitmap back into the bitmap sent here.
'
Call BitBlt(lHDCTemp, lSrcStartX, lSrcStartY, x, y, lHDCSave, 0&, 0&, vbSrcCopy)
'
' Delete memory bitmaps.
'
DeleteObject SelectObject(lHDCBack, lBmBackOld)
DeleteObject SelectObject(lHDCObject, lBmObjectOld)
DeleteObject SelectObject(lHDCMem, lBmMemOld)
DeleteObject SelectObject(lHDCSave, lBmSaveOld)
'
' Delete memory DC's
'
DeleteDC lHDCMem
DeleteDC lHDCBack
DeleteDC lHDCObject
DeleteDC lHDCSave
DeleteDC lHDCTemp
End Sub
'*** pDrawTransparentBitmap **************************************************



'*** pSaveSettings ***********************************************************
'*
'* Save the current options to the registry.
'*
'*****************************************************************************
Public Sub pSaveSettings()
  Dim i As Long
  Dim upper As Long
  
  Dim keys() As Variant
  Dim p As Param
  
  With engine
    keys = .Params.keys()
    upper = .Params.Count - 1
    
    For i = 0 To upper
      Set p = .Params.Item(keys(i))
      fWriteValue "HKCU", cREGKEY, keys(i), "S", p.asString
    Next
  End With
  
  Set p = Nothing
  
End Sub
'*** pSaveSettings ***********************************************************



'*** pLoadSettings ***********************************************************
'*
'* Read the current options from the registry.
'*
'*****************************************************************************
Public Sub pLoadSettings()
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
  
End Sub
'*** pLoadSettings ***********************************************************



'*** DetermineState **********************************************************
'*
'*****************************************************************************
Public Sub DetermineState()
  Dim lTemp    As Long
  Dim sCommand As String
  Dim sOption  As String
  
  ' Get the command line parameters.
  sCommand = LCase(Trim(Command()))
  sOption = Left(sCommand, 2)
  
  'Only allow a single instance of the screen saver under normal operation.
  'When the PC is idle for the specified period of time, Windows will launch
  'your screen saver continually with a "/s" parameter. When you click the
  'Preview button on the Display Properties dialog the screen saver is also
  'started with the "/s" switch. In this case you want a second instance to
  'run since the first instance will be running in the small preview window.
  'To distinguish between the two scenarios, use FindWindow to see if the
  '"Display Properties" dialog is open.
  lTemp = FindWindow(vbNullString, cPREVIEW_WINDOW)
  If App.PrevInstance And sOption = "/s" And lTemp = 0 Then End
  
  ' Process the command line parameters.
  Select Case sOption
    Case "", "/s" '/s
      initNormal lTemp
      StartScreensaver
      
    Case "/p"  '/p <hwnd>
      initPreview sCommand
      StartScreensaver
      
    Case "/c"  '/c:<hwnd>
        ' Display the screen saver configuration dialog.
        frmSetup.Show vbModal
        
    Case Else
      Err.Raise -20000001, App.EXEName, "Unknown parameter passed by operating system (" & sOption & ")." & vbNewLine & vbNewLine & "Please report this to Kavius <k@vius.ca>"
      
  End Select
End Sub
'*** DetermineState **********************************************************



'*** StartScreenSaver ********************************************************
'*
'*****************************************************************************
Private Sub StartScreensaver()
  Dim win As Form
  
  If (engine Is Nothing) Then
    Set engine = New clsSwarm
  End If
  Set win = frmMain
  
  'Get the Desktop window's dimensions.
  GetWindowRect GetDesktopWindow(), gDispRec
  'Load the main form.
  Load frmMain
    
  ' Maximize the main form and make it the top-most window.
  With gDispRec
    'SetWindowPos frmMain.hwnd, HWND_TOPMOST, .Top, .Left, .Right, .Bottom, SWP_SHOWWINDOW
    SetWindowPos frmMain.hwnd, HWND_TOP, .Top, .Left, .Right, .Bottom, SWP_SHOWWINDOW
  End With
  With win
    Set .DrawClass = engine
    .Visible = True
  End With
  engine.screenhack win
  pSaveSettings
  
  Set engine = Nothing
  Set win = Nothing
  Unload frmMain
End Sub
'*** StartScreenSaver ********************************************************



'*** initNormal **************************************************************
'* Start the Screen Saver.
'*****************************************************************************
Private Sub initNormal(ByVal lTemp As Long)

  'Store screen saver's run mode.
  glRunMode = RM_NORMAL
  
  ' Prevent the user from using ALT+TAB to switch to another application or
  ' CTRL+ALT+DELETE to kill the Screen Saver.
  SystemParametersInfo SPI_SCREENSAVERRUNNING, True, lTemp, 0
End Sub
'*** initNormal **************************************************************



'*** initPreview *************************************************************
'*
'* Preview Mode.  Run inside of the Screen Saver Configuration Viewer.
'*
'* When the screen saver is called in Preview mode it is passed "/p <hwnd>"
'* where <hwnd> is the handle of the Preview window.
'*
'*****************************************************************************
Private Sub initPreview(ByVal cmd As String)
  Dim i        As Long
  Dim lStyle   As Long
  Dim lLen     As Long
  Dim sStr     As String
  Dim arrCmd() As String
  
  ' Get the handle and client area dimensions of the Preview DeskTop window.
  glRunMode = RM_PREVIEW
  arrCmd = Split(cmd, " ")
  lLen = UBound(arrCmd)
  
  For i = lLen To LBound(arrCmd) Step -1
    sStr = arrCmd(i)
    If IsNumeric(sStr) Then
      glDisplayHwnd = Val(sStr)
      Exit For
    End If
  Next
  
  GetClientRect glDisplayHwnd, gDispRec
  
  ' Load the Screen Saver form.
  Load frmMain
          
  With frmMain
    'Set its caption consistant with Windows screen savers.
    .Caption = "Preview"
    'Get the form's current window style.
    lStyle = GetWindowLong(.hwnd, GWL_STYLE)
    'Convert it to a child window.
    lStyle = lStyle Or WS_CHILD
    SetWindowLong .hwnd, GWL_STYLE, lStyle
    'Set its parent window to be the Preview window.
    SetParent .hwnd, glDisplayHwnd
    'Save the Preview window's handle in the form's window structure.
    SetWindowLong .hwnd, GWL_HWNDPARENT, glDisplayHwnd
  End With
  
  ' Show the screen saver in the Preview window.
  SetWindowPos frmMain.hwnd, HWND_TOP, 0&, 0&, gDispRec.Right, gDispRec.Bottom, SWP_NOZORDER Or SWP_NOACTIVATE Or SWP_SHOWWINDOW
 End Sub
'*** initPreview *************************************************************



'*** ReportError *************************************************************
'*
'*****************************************************************************
Public Sub ReportError(routine As String)
  If (Err.Number <> 0) Then
    MsgBox "Error " & Err.Number & " in " & routine & ":" & vbNewLine & Err.Description, vbOKOnly, "Swarm: Error (" & Err.Number & ")"
    Err.Clear
    End
  End If
End Sub
'*** ReportError *************************************************************
