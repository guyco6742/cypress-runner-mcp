#!/bin/bash

# 🔍 VERIFICATION SCRIPT
# Run this before uploading to ensure no sensitive data

echo "🔍 Checking for Sensitive Data..."
echo ""

errors=0
warnings=0

# Patterns to search for (potential sensitive data)
declare -A patterns=(
    ["Email addresses"]='[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}'
    ["API keys"]='(api[_-]?key|apikey|api[_-]?secret)'
    ["Passwords"]='(password|passwd|pwd)\s*[=:]\s*['"'"'"][^"'"'"']+['"'"'"]'
    ["Tokens"]='(token|access[_-]?token|auth[_-]?token)\s*[=:]\s*['"'"'"][^"'"'"']+['"'"'"]'
    ["Internal URLs"]='(http://|https://)(localhost|127\.0\.0\.1|192\.168\.|10\.)'
    ["File paths"]='(C:\\|D:\\|/Users/|/home/)[A-Za-z0-9\\/_-]+'
)

# Exceptions (allowed patterns)
exceptions=(
    "your-email@example.com"
    "YOUR-USERNAME"
    "Your Name"
    "/absolute/path"
    "/path/to"
    "example.com"
    "user@example.com"
)

echo "📂 Checking files..."
echo ""

# Check all relevant files
for file in $(find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" \) ! -path "*/node_modules/*" ! -path "*/dist/*"); do
    for pattern_name in "${!patterns[@]}"; do
        pattern="${patterns[$pattern_name]}"
        
        # Search for pattern
        matches=$(grep -iE "$pattern" "$file" 2>/dev/null || true)
        
        if [ ! -z "$matches" ]; then
            # Check if it's an exception
            is_exception=0
            for exception in "${exceptions[@]}"; do
                if echo "$matches" | grep -q "$exception"; then
                    is_exception=1
                    break
                fi
            done
            
            if [ $is_exception -eq 0 ]; then
                echo "❌ $pattern_name found in $file"
                ((errors++))
            fi
        fi
    done
done

# Check for placeholders
echo ""
echo "🔍 Checking for placeholders..."

if grep -q "YOUR-USERNAME\|your-email@example.com\|Your Name" package.json README.md SECURITY.md 2>/dev/null; then
    echo "⚠️  Placeholders found - remember to replace before uploading!"
    ((warnings++))
fi

# Display results
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "                    VERIFICATION RESULTS                    "
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ $errors -eq 0 ]; then
    echo "✅ No sensitive data detected!"
else
    echo "❌ $errors ERROR(S) FOUND - REVIEW BEFORE UPLOADING"
fi

if [ $warnings -gt 0 ]; then
    echo "⚠️  $warnings WARNING(S) - Address before uploading"
fi

# Check build
echo ""
echo "🔨 Checking if project builds..."
if npm run build > /dev/null 2>&1; then
    if [ -f "dist/index.js" ]; then
        echo "✅ Build successful!"
    else
        echo "❌ Build failed - dist/index.js not found"
        ((errors++))
    fi
else
    echo "❌ Build failed"
    ((errors++))
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo "🎉 Ready to upload to GitLab!"
    exit 0
elif [ $errors -eq 0 ]; then
    echo "⚠️  Address warnings before uploading"
    exit 0
else
    echo "🛑 Fix errors before uploading"
    exit 1
fi
