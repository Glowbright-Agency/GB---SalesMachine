#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os

PORT = 8080

print("🧪 Testing your connection...")
print("="*40)

# Create a simple test page
test_html = """
<!DOCTYPE html>
<html>
<head>
    <title>Connection Test - GB Sales Machine</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(to br, #c084fc, #a78bfa, #818cf8);
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 500px;
        }
        h1 { color: #1f2937; }
        .success { color: #10b981; font-size: 48px; }
        .btn {
            background: #1f2937;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
        }
        .btn:hover { background: #374151; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">✅</div>
        <h1>Connection Working!</h1>
        <p>Great! Your browser can connect to local servers.</p>
        <p>This means the GB Sales Machine app should work too.</p>
        <p>Now let's start the actual app:</p>
        <ol style="text-align: left; display: inline-block;">
            <li>Close this window</li>
            <li>Double-click the <strong>START_APP.command</strong> file</li>
            <li>The app will open automatically</li>
        </ol>
    </div>
</body>
</html>
"""

# Write the test file
with open('test_connection.html', 'w') as f:
    f.write(test_html)

# Start server
Handler = http.server.SimpleHTTPRequestHandler

print(f"✅ Test server running at: http://localhost:{PORT}/test_connection.html")
print("\nOpening your browser now...")

# Open browser
webbrowser.open(f'http://localhost:{PORT}/test_connection.html')

print("\n" + "="*40)
print("Press Ctrl+C to stop this test server")
print("="*40)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()