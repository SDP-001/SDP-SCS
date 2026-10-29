$ErrorActionPreference = "Stop"

$AppDir = "c:\Users\SDP\OneDrive\Desktop\NEC-SCS-main (2)\NEC-SCS-main\NEC-SCS-main"
$IconPath = Join-Path $AppDir "public\nec-portal.ico"
$StartMenu = [System.Environment]::GetFolderPath('Programs')
$Desktop = "C:\Users\SDP\OneDrive\Desktop"

# 1. Determine Browser Executable (Edge or Chrome)
$BrowserPath = ""
if (Test-Path "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe") {
    $BrowserPath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
} elseif (Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe") {
    $BrowserPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
} else {
    $BrowserPath = "msedge.exe"
}

# 2. Create Start Menu Shortcut
$WshShell = New-Object -ComObject WScript.Shell
$StartMenuShortcutPath = Join-Path $StartMenu "NEC Portal.lnk"
$Shortcut = $WshShell.CreateShortcut($StartMenuShortcutPath)
$Shortcut.TargetPath = $BrowserPath
$Shortcut.Arguments = '--app="http://localhost:3000/login" --window-size=1280,850'
$Shortcut.Description = "Nandha Engineering College (Autonomous) - Student Credit System App"
$Shortcut.WorkingDirectory = $AppDir
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath,0"
}
$Shortcut.Save()
Write-Output "Created Start Menu App: $StartMenuShortcutPath"

# 3. Create Desktop Shortcut
$DesktopShortcutPath = Join-Path $Desktop "NEC Portal.lnk"
$ShortcutDesk = $WshShell.CreateShortcut($DesktopShortcutPath)
$ShortcutDesk.TargetPath = $BrowserPath
$ShortcutDesk.Arguments = '--app="http://localhost:3000/login" --window-size=1280,850'
$ShortcutDesk.Description = "Nandha Engineering College (Autonomous) - Student Credit System App"
$ShortcutDesk.WorkingDirectory = $AppDir
if (Test-Path $IconPath) {
    $ShortcutDesk.IconLocation = "$IconPath,0"
}
$ShortcutDesk.Save()
Write-Output "Created Desktop App: $DesktopShortcutPath"

# 4. Register in Windows Installed Apps (Settings -> Apps -> Installed Apps)
$RegPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\NECPortal"
if (-not (Test-Path $RegPath)) {
    New-Item -Path $RegPath -Force | Out-Null
}
Set-ItemProperty -Path $RegPath -Name "DisplayName" -Value "NEC Portal - Nandha Engineering College"
Set-ItemProperty -Path $RegPath -Name "DisplayIcon" -Value $IconPath
Set-ItemProperty -Path $RegPath -Name "Publisher" -Value "Nandha Engineering College (Autonomous)"
Set-ItemProperty -Path $RegPath -Name "DisplayVersion" -Value "1.0.0"
Set-ItemProperty -Path $RegPath -Name "URLInfoAbout" -Value "http://localhost:3000"
Set-ItemProperty -Path $RegPath -Name "InstallLocation" -Value $AppDir
Write-Output "Registered NEC Portal in Windows Installed Applications Registry."

