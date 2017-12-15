VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "Param"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
'*****************************************************************************
'* $Id: Param.cls 17 2004-04-15 22:33:33Z jeff.cave $
'*
'* This is just a value holder with ranges. Depending on what datatype an
'* item is, the class will behave differently:
'*
'* Strings:
'*   all values must be between min and max characters in length
'*
'* Numeric (int or float):
'*   must be numeric between min and max
'*
'* Int:
'*   Values are truncated on their way in
'*
'* Cur:
'*   Values are truncated at the 4th decimal place

'* Note:
'*   The MS Variant:
'*
'*  Empty     Variant is uninitialized. Value is 0 for numeric variables or a
'*            zero-length string ("") for string variables.
'*  Null      Variant intentionally contains no valid data.
'*  Boolean   Contains either True or False.
'*  Byte      Contains integer in the range 0 to 255.
'*  Integer   Contains integer in the range -32,768 to 32,767.
'*  Currency  -922,337,203,685,477.5808 to 922,337,203,685,477.5807.
'*  Long      Contains integer in the range -2,147,483,648 to 2,147,483,647.
'*  Single    Contains a single-precision, floating-point number in the range
'*            -3.402823E38 to -1.401298E-45 for negative values; 1.401298E-45
'*            to 3.402823E38 for positive values.
'*  Double    Contains a double-precision, floating-point number in the range
'*            -1.79769313486232E308 to -4.94065645841247E-324 for negative
'*            values; 4.94065645841247E-324 to 1.79769313486232E308 for
'*            positive values.
'*  Date      Contains a number that represents a date between January 1, 100
'*            to December 31, 9999.
'*  String    Contains a variable-length string that can be up to
'*            approximately 2 billion characters in length.
'*  Object    Contains an object.
'*  Error     Contains an error number.
'*
'*****************************************************************************
Option Explicit

Public Enum paramType
  typeSTR = 0
  typeINT = 1
  typeFLT = 2
End Enum

Private pMIN As Double
Private pMAX As Double
Private pDataType As paramType

Private pVal As Variant

Public Static Property Get strTypeID(ByVal t As paramType) As String
  Select Case t
    Case typeSTR: strTypeID = "STR"
    Case typeINT: strTypeID = "INT"
    Case typeFLT: strTypeID = "FLT"
  End Select
End Property



'*** let asString ************************************************************
'*
'*****************************************************************************
Public Property Let asString(ByVal newVal As String)
  Dim aVals() As String
  Dim i As Long
  Static strTypeSTR As String
  
  If (strTypeSTR = "") Then
    strTypeSTR = strTypeID(typeSTR)
  End If
  
  newVal = Trim(newVal)
  aVals = Split(newVal, ",")
  If (aVals(0) = strTypeSTR) Then
    newVal = Right(newVal, Len(newVal) - Len(strTypeSTR) - 1)
  Else
    With Me
      .MIN = CDbl(aVals(1))
      .MAX = CDbl(aVals(2))
      .Val = CDbl(aVals(3))
    End With
  End If
End Property
'*** let asString ************************************************************



'*** get asString ************************************************************
'*
'*****************************************************************************
Public Property Get asString() As String
  If (pDataType = typeSTR) Then
    asString = Me.Val
  Else
    asString = Me.MIN & "," & Me.MAX & "," & Me.Val
  End If
  asString = strTypeID(pDataType) & "," & asString
End Property
'*** get asString ************************************************************



'*** let DataType ************************************************************
'*
'*****************************************************************************
Public Property Let DataType(ByVal newType As paramType)
  If (newType <> pDataType) Then
    pDataType = newType
    Me.Val = pVal
  End If
End Property
'*** let DataType ************************************************************



'*** get DataType ************************************************************
'*
'*****************************************************************************
Public Property Get DataType() As paramType
  DataType = pDataType
End Property
'*** get DataType ************************************************************



'*** let MAX *****************************************************************
'*
'*****************************************************************************
Public Property Let MAX(ByVal newVal As Double)
  If (newVal = pMAX) Then
    Exit Property
  End If
  
  If (newVal < pMIN) Then
    newVal = pMIN
  End If
  
  pMAX = newVal
  
  Me.Val = pVal
End Property
'*** let MAX *****************************************************************



'*** get MAX *****************************************************************
'*
'*****************************************************************************
Public Property Get MAX() As Double
  MAX = pMAX
End Property
'*** get MAX *****************************************************************



'*** let MIN *****************************************************************
'*
'*****************************************************************************
Public Property Let MIN(ByVal newVal As Double)
  If (newVal = pMIN) Then
    Exit Property
  End If
  
  If (newVal > pMAX) Then
    newVal = pMAX
  End If
  
  pMIN = newVal
  
  Me.Val = pVal
End Property
'*** let MIN *****************************************************************



'*** get MIN *****************************************************************
'*
'*****************************************************************************
Public Property Get MIN() As Double
  MIN = pMIN
End Property
'*** get MIN *****************************************************************



'*** let Val *****************************************************************
'*
'*****************************************************************************
Public Property Let Val(ByVal newVal As Variant)
  Dim tmp As Long
  
  If (pDataType = typeSTR) Then
     newVal = "" & newVal
     tmp = Len(newVal)
     If (tmp < pMIN) Then
       'not sure what to do
     End If
     If (tmp > pMAX) Then
       newVal = Left(newVal, pMAX)
     End If
  Else
    newVal = CDbl(newVal)
    If (newVal < MIN) Then
      newVal = MIN
    End If
    If (newVal > MAX) Then
      newVal = MAX
    End If
    If (DataType = typeINT) Then
      newVal = Fix(newVal)
    End If
  End If
  
  pVal = newVal
End Property
'*** let Val *****************************************************************



'*** get Val *****************************************************************
'*
'*****************************************************************************
Public Property Get Val() As Variant
  Val = pVal
End Property
'*** get Val *****************************************************************



'*** Create ******************************************************************
'*
'*****************************************************************************
Public Function Create(ByVal dType As paramType, ByVal minVal As Double, ByVal maxVal As Double, ByVal value As Variant) As Param
  Dim p As Param
  
  Set p = New Param
  
  With p
    .DataType = dType
    .MIN = minVal
    .MAX = maxVal
    .Val = value
  End With
  
  Set Create = p
  Set p = Nothing
  
End Function
'*** Create ******************************************************************

