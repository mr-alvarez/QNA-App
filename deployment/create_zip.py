import zipfile
import os

# Remove old zip
if os.path.exists('deployment.zip'):
    os.remove('deployment.zip')

# Create new zip with proper paths
with zipfile.ZipFile('deployment.zip', 'w', zipfile.ZIP_DEFLATED) as zf:
    # Add root files
    zf.write('flask_app.py', arcname='flask_app.py')
    zf.write('requirements.txt', arcname='requirements.txt')
    zf.write('web.config', arcname='web.config')
    zf.write('.gitignore', arcname='.gitignore')
    zf.write('README_DEPLOYMENT.md', arcname='README_DEPLOYMENT.md')
    
    # Add static files with forward slashes
    zf.write('static/index.html', arcname='static/index.html')
    zf.write('static/main.js', arcname='static/main.js')
    zf.write('static/styles.css', arcname='static/styles.css')

print('✓ deployment.zip created with Linux-compatible paths')
print(f'Size: {os.path.getsize("deployment.zip")} bytes')
print()
print('Contents:')
with zipfile.ZipFile('deployment.zip', 'r') as zf:
    for name in zf.namelist():
        print(f'  {name}')
