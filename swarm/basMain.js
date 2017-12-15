/*****************************************************************************
 * 
 *****************************************************************************/
'use strict';


const engine = new clsSwarm();


/*
//----------------------------------------------------------------------
// Public Variables.
//----------------------------------------------------------------------
Public glDisplayHwnd As Long          // Handle of Preview window.
Public glRunMode     As Long          // Screen saver running mode (run, preview, setup)
Public glDeskDC      As Long          // Desktop device context handle.
Public gDispRec      As RECT          // Rectangle values of Preview window.
Public gDeskBmp      As BITMAP        // Bitmap copy of the desktop.

//----------------------------------------------------------------------
// Application Specific Constants.
//----------------------------------------------------------------------
Public Const cPREVIEW_WINDOW = "Display Properties"
Public Const cREGKEY = "Software\Vius\Swarm"

// ScreenSaver Running Modes.
Public Const RM_NORMAL = 1
Public Const RM_CONFIGURE = 2
Public Const RM_PREVIEW = 4

//----------------------------------------------------------------------
//Public API Declares.
//----------------------------------------------------------------------
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

//----------------------------------------------------------------------
//Public Constants.
//----------------------------------------------------------------------
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

// Windows messages.
Public Const WM_PAINT          As Long = &HF&
Public Const WM_ACTIVATEAPP    As Long = &H1C&
Public Const SW_SHOWNOACTIVATE As Long = 4&

// Get Windows Long Constants.
Public Const GWL_USERDATA As Long = (-21&)
Public Const GWL_WNDPROC  As Long = (-4&)
*/


//*** Main ********************************************************************
//*
//*****************************************************************************
document.addEventListener('load',DetermineState);
//*** Main ********************************************************************



//*** pLoadSettings ***********************************************************
//*
//* Read the current options from the registry.
//*
//*****************************************************************************
function pLoadSettings(){
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
  
}
//*** pLoadSettings ***********************************************************



/*** StartScreenSaver *********************************************************
 *
 *****************************************************************************/
function StartScreensaver(){
  let win = null;
  
  Set win = frmMain
  
  engine.screenhack(win);
}
/*** StartScreenSaver ********************************************************/



/*** ReportError **************************************************************
 *
 *****************************************************************************/
if(window){
  function unhandledError(err){
    console.debug("UNHANDLED ERROR");
    console.debug(err);
  }
  window.addEventListener('error',unhandledError);
}
/*** ReportError *************************************************************/
