$scriptPath = 'v:\Projetos\Ecossistema aculpaedasovelhas\.Bible Belem AnC-2025\scripts\scheduled-translate.ps1'
$argStr = "-ExecutionPolicy Bypass -NoProfile -File `"$scriptPath`""
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $argStr
$trigger = New-ScheduledTaskTrigger -Once -At '21:00'
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName 'BibleBelemTranslate' -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest -Force
Write-Host 'Tarefa agendada criada com sucesso!'
Get-ScheduledTask -TaskName 'BibleBelemTranslate' | Format-List TaskName, State
