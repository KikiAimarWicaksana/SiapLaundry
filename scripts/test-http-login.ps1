$body = '{"emailOrPhone":"buyer@demo.com","password":"password123","role":"buyer"}'
$headers = @{ "Content-Type" = "application/json" }
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -Headers $headers -UseBasicParsing
    Write-Host "Status:" $response.StatusCode
    Write-Host "Body:" $response.Content
} catch {
    Write-Host "Error:" $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response:" $reader.ReadToEnd()
    }
}
