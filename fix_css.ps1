$rest = Get-Content 'static/css/style.css' | Select-Object -Skip 130
$header = Get-Content 'static/css/style.css_temp'
$header + $rest | Set-Content 'static/css/style.css'
