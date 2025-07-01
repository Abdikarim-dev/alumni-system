# Assets Folder Structure

This document outlines the complete assets folder structure for the Alumni Network Flutter application.

## Folder Structure

\`\`\`
assets/
├── images/
│   ├── 1.5x/
│   ├── 2.0x/
│   ├── 3.0x/
│   ├── avatars/
│   ├── icons/
│   ├── logos/
│   ├── backgrounds/
│   └── placeholders/
├── fonts/
│   ├── Inter/
│   └── custom/
├── data/
│   ├── json/
│   └── config/
├── animations/
│   └── lottie/
└── audio/
    └── notifications/
\`\`\`

## Asset Types and Usage

### Images
- **Location**: `assets/images/`
- **Supported formats**: PNG, JPG, JPEG, GIF, WebP, BMP, WBMP
- **Density variants**: 1.5x, 2.0x, 3.0x folders for different screen densities

### Fonts
- **Location**: `assets/fonts/`
- **Supported formats**: TTF, OTF
- **Organization**: By font family in subfolders

### Data Files
- **Location**: `assets/data/`
- **Types**: JSON configuration files, static data

### Animations
- **Location**: `assets/animations/`
- **Types**: Lottie JSON files, Rive files

### Audio
- **Location**: `assets/audio/`
- **Types**: MP3, WAV, AAC for notification sounds
\`\`\`

\`\`\`


```svg isHidden file="assets/images/logo.svg"
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="24" fill="#2E7D32"/>
  <path d="M60 30L75 45H65V75H55V45H45L60 30Z" fill="white"/>
  <path d="M30 75H90V85H30V75Z" fill="white"/>
  <circle cx="60" cy="60" r="25" stroke="white" stroke-width="2" fill="none"/>
  <text x="60" y="100" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">ALUMNI</text>
</svg>
