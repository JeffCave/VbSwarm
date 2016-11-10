Attribute VB_Name = "Structs"
'*****************************************************************************
'* $Id$
'*****************************************************************************
Option Explicit

Public Type POINTAPI
  x As Long
  y As Long
End Type

Public Type RECT
  Left   As Long
  Top    As Long
  Right  As Long
  Bottom As Long
End Type

Public Type BITMAP
  bmType       As Long
  bmWidth      As Long
  bmHeight     As Long
  bmWidthBytes As Long
  bmPlanes     As Integer
  bmBitsPixel  As Integer
  bmBits       As Long
End Type

Public Type SECURITY_ATTRIBUTES
  nLength              As Long
  lpSecurityDescriptor As Long
  bInheritHandle       As Boolean
End Type

Public Type ResBitmap
  ResID  As Long
  Sprite As StdPicture
End Type




