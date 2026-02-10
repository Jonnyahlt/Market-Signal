# Windows Troubleshooting Guide

## Problem: "UNKNOWN: unknown error, open layout.css"

Detta är ett Windows-specifikt problem med Next.js cache.

### Lösning 1: Rensa cache (Rekommenderat)

```powershell
# Stoppa dev server (Ctrl+C)

# Ta bort .next mappen
Remove-Item -Recurse -Force .next

# Ta bort node_modules (optional men rekommenderat)
Remove-Item -Recurse -Force node_modules

# Installera igen
npm install

# Bygg från scratch
npm run build

# Starta
npm run dev
```

### Lösning 2: Kör som Administrator

1. Högerklicka på PowerShell/CMD
2. Välj "Run as Administrator"
3. Navigera till projektet
4. Kör `npm run dev`

### Lösning 3: Disable antivirus temporarily

Windows Defender kan ibland blocka Next.js från att skriva filer.

1. Öppna Windows Security
2. Virus & threat protection
3. Manage settings
4. Disable Real-time protection (temporary)
5. Kör `npm run dev`
6. Enable igen efter

### Lösning 4: Lägg till undantag i Windows Defender

1. Windows Security → Virus & threat protection
2. Manage settings → Exclusions
3. Add an exclusion → Folder
4. Lägg till: `D:\Programering\marketkollen`

### Lösning 5: WSL (Linux subsystem - BÄST!)

Windows Subsystem for Linux fungerar mycket bättre för Node.js:

```powershell
# Installera WSL
wsl --install

# Starta om datorn

# Öppna Ubuntu terminal
# Navigera till projekt
cd /mnt/d/Programering/marketkollen

# Installera och kör
npm install
npm run dev
```

## Vilket ska du göra?

**Prova i denna ordning:**

1. **Lösning 1** (Rensa cache) - 90% chans att detta fixar det
2. **Lösning 4** (Windows Defender undantag) - Bra långsiktig lösning
3. **Lösning 5** (WSL) - Bästa utvecklingsmiljön för Node.js på Windows
