# 🔍 VERIFICATION SCRIPT
# Run this before uploading to ensure no sensitive data

Write-Host "🔍 Checking for Sensitive Data..." -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# Files to check
$files = Get-ChildItem -Path . -Recurse -File | Where-Object { 
    $_.Extension -in @('.ts', '.js', '.json', '.md', '.yml') -and 
    $_.FullName -notmatch 'node_modules' 
}

# Known safe patterns to exclude
$safePatterns = @(
    'guyco42@gmail.com',
    'your-email@example.com',
    'user@example.com',
    'example.com',
    'nodejs.org',
    'npmjs.com',
    'gitlab.com',
    'github.com',
    'guyco42-group',
    'Guy Cohen',
    '/absolute/path',
    '/path/to',
    'C:/path/to'
)

Write-Host "📂 Checking $($files.Count) files for sensitive data..." -ForegroundColor Yellow
Write-Host ""

$foundIssues = $false

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    
    if ($content) {
        # Check for potential sensitive emails (excluding known safe ones)
        $emailMatches = [regex]::Matches($content, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
        foreach ($match in $emailMatches) {
            $isSafe = $false
            foreach ($safe in $safePatterns) {
                if ($match.Value -eq $safe) {
                    $isSafe = $true
                    break
                }
            }
            if (-not $isSafe) {
                $errors += "❌ Email found in $($file.Name): '$($match.Value)'"
                $foundIssues = $true
            }
        }
        
        # Check for API keys or tokens
        if ($content -match '(api[_-]?key|apikey|api[_-]?secret)[\s]*[=:][\s]*[''"`][^''"`]+[''"`]') {
            $errors += "❌ Potential API key found in $($file.Name)"
            $foundIssues = $true
        }
        
        # Check for passwords
        if ($content -match '(password|passwd|pwd)[\s]*[=:][\s]*[''"`][^''"`]+[''"`]') {
            $errors += "❌ Potential password found in $($file.Name)"
            $foundIssues = $true
        }
        
        # Check for tokens
        if ($content -match '(token|access[_-]?token|auth[_-]?token)[\s]*[=:][\s]*[''"`][^''"`]+[''"`]') {
            $errors += "❌ Potential token found in $($file.Name)"
            $foundIssues = $true
        }
        
        # Check for internal URLs
        if ($content -match '(http://|https://)(localhost|127\.0\.0\.1|192\.168\.|10\.)') {
            $errors += "❌ Internal URL found in $($file.Name)"
            $foundIssues = $true
        }
    }
}

# Check for placeholders
Write-Host "🔍 Checking for placeholders..." -ForegroundColor Yellow

$placeholderFiles = @('package.json', 'README.md', 'SECURITY.md', 'LICENSE')
foreach ($fileName in $placeholderFiles) {
    if (Test-Path $fileName) {
        $content = Get-Content $fileName -Raw -ErrorAction SilentlyContinue
        if ($content -match 'YOUR-USERNAME' -or $content -match 'Your Name' -or $content -match '\[Your Name') {
            $warnings += "⚠️  Placeholder found in $fileName - remember to replace before uploading!"
        }
    }
}

# Display results
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    VERIFICATION RESULTS                    " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0) {
    Write-Host "✅ No sensitive data detected!" -ForegroundColor Green
} else {
    Write-Host "❌ ERRORS FOUND - REVIEW BEFORE UPLOADING:" -ForegroundColor Red
    Write-Host ""
    foreach ($error in $errors) {
        Write-Host $error -ForegroundColor Red
    }
}

Write-Host ""

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  WARNINGS:" -ForegroundColor Yellow
    Write-Host ""
    foreach ($warning in $warnings) {
        Write-Host $warning -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Check build
Write-Host ""
Write-Host "🔨 Checking if project builds..." -ForegroundColor Cyan
try {
    $buildOutput = npm run build 2>&1
    if (Test-Path "dist/index.js") {
        Write-Host "✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed - dist/index.js not found" -ForegroundColor Red
        $errors += "Build failed"
    }
} catch {
    Write-Host "❌ Build failed: $_" -ForegroundColor Red
    $errors += "Build error: $_"
}

Write-Host ""
Write-Host "✨ Verification complete!" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 Ready to upload to GitLab!" -ForegroundColor Green
    exit 0
} elseif ($errors.Count -eq 0) {
    Write-Host "⚠️  Address warnings before uploading" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "🛑 Fix errors before uploading" -ForegroundColor Red
    exit 1
}
