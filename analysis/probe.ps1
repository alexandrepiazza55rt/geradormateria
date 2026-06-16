$ErrorActionPreference = "Stop"
$dir = "C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3"
$orig = (Get-ChildItem -LiteralPath $dir -Filter *.xlsm | Select-Object -First 1).FullName
$path = Join-Path $env:TEMP "genmat_probe.xlsm"
Copy-Item -LiteralPath $orig -Destination $path -Force
try { Unblock-File -LiteralPath $path } catch {}
Write-Output "Opening local copy: $path"
. "C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\analysis\xlcom.ps1"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$excel.AskToUpdateLinks = $false
$excel.EnableEvents = $false
$excel.ScreenUpdating = $false
$excel.AutomationSecurity = 3
$wb = $null
try {
    # Open(Filename, UpdateLinks=0, ReadOnly=true, Format, Password, ..., IgnoreReadOnlyRecommended=true)
    $wb = $excel.Workbooks.Open($path, 0, $true)
    Start-Sleep -Milliseconds 800
    Write-Output ("Workbooks.Count = " + $excel.Workbooks.Count)
    Write-Output ("ProtectedViewWindows.Count = " + $excel.ProtectedViewWindows.Count)
    if ($excel.ProtectedViewWindows.Count -gt 0) {
        Write-Output "Workbook is in PROTECTED VIEW -> enabling edit..."
        $wb = $excel.ProtectedViewWindows.Item(1).Edit()
        Start-Sleep -Milliseconds 800
    }
    Write-Output ("Worksheets.Count = " + $wb.Worksheets.Count)

    function Recalc {
        for ($t=0; $t -lt 40; $t++) { try { $excel.CalculateFull(); return } catch { Start-Sleep -Milliseconds 400 } }
        throw "CalculateFull kept failing"
    }
    for ($t=0; $t -lt 20; $t++) { try { $excel.Calculation = -4135; break } catch { Start-Sleep -Milliseconds 400 } }

    $mv = $wb.Worksheets.Item(7)
    Write-Output ("Output sheet = " + $mv.Name)

    function Probe($sheetIdx, $cell, $label) {
        $ws = $wb.Worksheets.Item($sheetIdx)
        $orig = $ws.Range($cell).Value2
        $ws.Range($cell).Value2 = 1
        Recalc
        $data = $mv.Range("B19:E1255").Value2
        $rows = $data.GetLength(0)
        Write-Output ("===== PROBE [" + $label + "] : set " + $ws.Name + "!" + $cell + " = 1 =====")
        $n = 0
        for ($i=1; $i -le $rows; $i++) {
            $q = $data[$i,4]
            if ($null -ne $q -and [double]$q -ne 0) {
                Write-Output ("  SAP={0,-8} QTD={1,-7} {2} [{3}]" -f $data[$i,1], $q, $data[$i,2], $data[$i,3])
                $n++
            }
        }
        Write-Output ("  (nonzero materials: " + $n + ")")
        $ws.Range($cell).Value2 = $orig
        Recalc
    }

    Probe 1 "F5" "Mono13.8 CFU-AVULSO pole DT-10/150"
    Probe 1 "L5" "Mono13.8 U1 / 2CAA / DT-10/150"
    Probe 3 "X5" "Tri13.8 col X row5"
}
finally {
    if ($null -ne $wb) { try { $wb.Close($false) } catch {} }
    try { $excel.Quit() } catch {}
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}
Write-Output "DONE"
