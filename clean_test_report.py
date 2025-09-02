import re

# Read the original clone
with open('test-report-clone.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Define patterns for errors that have been fixed
fixed_patterns = [
    r'Error: Uncaught \[TypeError: Cannot read properties of undefined \(reading \'map\'\)\].*?at Object\.<anonymous>.*?\n',
    r'Error: Uncaught \[TypeError: Cannot read properties of undefined \(reading \'length\'\)\].*?at Object\.<anonymous>.*?\n',
    r'detail: TypeError: Cannot read properties of undefined \(reading \'map\'\).*?\n',
    r'detail: TypeError: Cannot read properties of undefined \(reading \'length\'\).*?\n',
    r'ErrorBoundary caught TypeError: Cannot read properties of undefined \(reading \'map\'\).*?\n',
    r'ErrorBoundary caught TypeError: Cannot read properties of undefined \(reading \'length\'\).*?\n',
    r'.*AdminDashboard\.tsx:155.*\n',
    r'.*AnalyticsCharts\.tsx:21.*\n',
    r'.*FullDashboard\.tsx:173.*\n',
    r'.*SectionRenderer\.tsx:39.*\n'
]

# Remove the fixed error patterns
cleaned_content = content
for pattern in fixed_patterns:
    cleaned_content = re.sub(pattern, '', cleaned_content,
                             flags=re.DOTALL | re.MULTILINE)

# Write the cleaned content
with open('test-report-clone-fixed.txt', 'w', encoding='utf-8') as f:
    f.write(cleaned_content)

print('Fixed errors removed from test report clone')
