import zipfile
import os

def zipdir(path, ziph):
    for root, dirs, files in os.walk(path):
        for file in files:
            if file != 'project.zip' and not file.endswith('.pyc'):
                ziph.write(os.path.join(root, file),
                           os.path.relpath(os.path.join(root, file), path))

with zipfile.ZipFile('project.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir('.', zipf)

print("Zipped successfully.")

