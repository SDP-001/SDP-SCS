$AppDir = "c:\Users\SDP\OneDrive\Desktop\NEC-SCS-main (2)\NEC-SCS-main\NEC-SCS-main"
$IconPath = Join-Path $AppDir "public\nec-portal.ico"
$StartMenu = [System.Environment]::GetFolderPath('Programs')
$Desktop = "C:\Users\SDP\OneDrive\Desktop"

$BrowserPath = "msedge.exe"
if (Test-Path "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe") {
    $BrowserPath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
} elseif (Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe") {
    $BrowserPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
}

$WshShell = New-Object -ComObject WScript.Shell

$StartMenuShortcut = $WshShell.CreateShortcut((Join-Path $StartMenu "NEC Portal.lnk"))
$StartMenuShortcut.TargetPath = $BrowserPath
$StartMenuShortcut.Arguments = '--app="https://nec-portal-six.vercel.app/login" --window-size=1280,850'
$StartMenuShortcut.Description = "Nandha Engineering College - Student Credit System App"
$StartMenuShortcut.WorkingDirectory = $AppDir
if (Test-Path $IconPath) { $StartMenuShortcut.IconLocation = "$IconPath,0" }
$StartMenuShortcut.Save()

$DesktopShortcut = $WshShell.CreateShortcut((Join-Path $Desktop "NEC Portal.lnk"))
$DesktopShortcut.TargetPath = $BrowserPath
$DesktopShortcut.Arguments = '--app="https://nec-portal-six.vercel.app/login" --window-size=1280,850'
$DesktopShortcut.Description = "Nandha Engineering College - Student Credit System App"
$DesktopShortcut.WorkingDirectory = $AppDir
if (Test-Path $IconPath) { $DesktopShortcut.IconLocation = "$IconPath,0" }
$DesktopShortcut.Save()

Write-Output "Desktop and Start Menu shortcuts updated to permanent production URL!"

