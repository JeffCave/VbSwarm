VERSION 5.00
Object = "{6B7E6392-850A-101B-AFC0-4210102A8DA7}#1.3#0"; "COMCTL32.OCX"
Begin VB.Form frmSetup 
   Caption         =   "Swarm Options"
   ClientHeight    =   3195
   ClientLeft      =   60
   ClientTop       =   345
   ClientWidth     =   5325
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   ScaleHeight     =   3195
   ScaleWidth      =   5325
   ShowInTaskbar   =   0   'False
   StartUpPosition =   2  'CenterScreen
   Begin VB.CommandButton cmdAbout 
      Caption         =   "About"
      Height          =   435
      Left            =   4320
      TabIndex        =   9
      Top             =   240
      Width           =   855
   End
   Begin VB.CommandButton cmdOK 
      Caption         =   "OK"
      Height          =   435
      Left            =   3360
      TabIndex        =   8
      Top             =   2640
      Width           =   855
   End
   Begin VB.CommandButton cmdCancel 
      Caption         =   "Cancel"
      Height          =   435
      Left            =   4320
      TabIndex        =   7
      Top             =   2640
      Width           =   855
   End
   Begin VB.Frame frSize 
      Caption         =   "Bug Size"
      Height          =   735
      Left            =   120
      TabIndex        =   2
      Top             =   840
      Width           =   5175
      Begin VB.TextBox txtSize 
         Height          =   285
         Left            =   4680
         TabIndex        =   6
         Top             =   240
         Width           =   375
      End
      Begin ComctlLib.Slider sldSize 
         Height          =   375
         Left            =   720
         TabIndex        =   3
         Top             =   240
         Width           =   3255
         _ExtentX        =   5741
         _ExtentY        =   661
         _Version        =   327682
         OLEDropMode     =   1
         TickStyle       =   3
      End
      Begin VB.Label Label2 
         Caption         =   "Large"
         Height          =   255
         Left            =   4080
         TabIndex        =   5
         Top             =   240
         Width           =   495
      End
      Begin VB.Label Label1 
         Caption         =   "Small"
         Height          =   255
         Left            =   120
         TabIndex        =   4
         Top             =   240
         Width           =   495
      End
   End
   Begin VB.Frame frGen 
      Caption         =   "General"
      Height          =   615
      Left            =   120
      TabIndex        =   0
      Top             =   120
      Width           =   4095
      Begin VB.CheckBox chkClearScreen 
         Caption         =   "Clear Screen"
         Height          =   255
         Left            =   120
         TabIndex        =   1
         Top             =   240
         Width           =   1215
      End
   End
End
Attribute VB_Name = "frmSetup"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
'*****************************************************************************
'* $Id: frmSetup.frm 17 2004-04-15 22:33:33Z jeff.cave $
'*****************************************************************************
Option Explicit

Private pDrawClass As Object ' engine.
Private PropBag As Scripting.Dictionary


'*** set DrawClass ***********************************************************
'*
'*****************************************************************************
Public Property Set DrawClass(ByRef newDraw As Object)
  Set pDrawClass = newDraw
  Set PropBag = pDrawClass.Params
End Property
'*** set DrawClass ***********************************************************



'*** chkClearScreen_Click ****************************************************
'* Save the clear screen option.
'*****************************************************************************
Private Sub chkClearScreen_Click()
  PropBag.Item("cls").Val = Abs(chkClearScreen.value = vbChecked)
End Sub
'*** chkClearScreen_Click ****************************************************



'*** cmdAbout_Click **********************************************************
'* Show a Help About dialog.
'*****************************************************************************
Private Sub cmdAbout_Click()
  Dim sTitle As String
  Dim sText  As String
  sTitle = "Vius.ca > WinSwarm"
  sText = _
    vbNewLine & _
    "By Jeff Cave" & vbNewLine & _
    "www.vius.ca" & vbCrLf & vbCrLf & _
    "original code by "
  ShellAbout Me.hwnd, sTitle, sText, Me.Icon.Handle
End Sub
'*** cmdAbout_Click **********************************************************



'*** cmdCancel_Click *********************************************************
'*
'*****************************************************************************
Private Sub cmdCancel_Click()
  Unload Me
End Sub
'*** cmdCancel_Click *********************************************************


'*** cmdOK_Click *************************************************************
'* Save the current screen saver settings.
'*****************************************************************************
Private Sub cmdOK_Click()
  pSaveSettings
  Unload Me
End Sub
'*** cmdOK_Click *************************************************************



'*** Form_Load ***************************************************************
'* Load the current screen saver registry settings.
'*****************************************************************************
Private Sub Form_Load()
  pLoadSettings
  
  If (pDrawClass Is Nothing) Then
    Set Me.DrawClass = engine
  End If
  LoadValues
End Sub
'*** Form_Load ***************************************************************



'*** Form_Unload *************************************************************
'*
'*****************************************************************************
Private Sub Form_Unload(Cancel As Integer)
  Set frmSetup = Nothing
End Sub
'*** Form_Unload *************************************************************



'*** sldSize_Scroll **********************************************************
'* Save the active sprite size.
'*****************************************************************************
Private Sub sldSize_Scroll()
  With PropBag.Item("TrailLen")
    .Val = sldSize.value
    txtSize.Text = .Val
  End With
End Sub
'*** sldSize_Scroll **********************************************************



'*** LoadValues **************************************************************
'*
'*****************************************************************************
Private Sub LoadValues()
  With PropBag
    With .Item("cls")
      chkClearScreen.value = IIf(.Val = 1, vbChecked, vbUnchecked)
    End With
    
    'size slider
    With .Item("TrailLen")
      sldSize.MIN = .MIN
      sldSize.MAX = .MAX
      sldSize.value = .Val
    End With
  End With
End Sub
'*** LoadValues **************************************************************

