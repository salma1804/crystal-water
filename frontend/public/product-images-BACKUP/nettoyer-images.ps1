# Usage :
# 1) Copie ce fichier (nettoyer-images.ps1) ET images-utilisees.txt
#    dans le dossier qui contient tes photos (ex: public\product-images)
# 2) Dans ce meme dossier, clic droit -> "Ouvrir dans le terminal" (ou PowerShell)
# 3) Lance :  .\nettoyer-images.ps1
#
# Ne supprime rien directement : deplace tout fichier non utilise
# vers un sous-dossier _anciennes-photos\

$liste = "images-utilisees.txt"
$dossierBackup = "_anciennes-photos"

if (-not (Test-Path $liste)) {
    Write-Host "Erreur : $liste introuvable dans ce dossier." -ForegroundColor Red
    Write-Host "Assure-toi d'avoir copie ce script ET images-utilisees.txt dans le meme dossier que tes photos."
    exit 1
}

$utilises = Get-Content $liste | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }

if (-not (Test-Path $dossierBackup)) {
    New-Item -ItemType Directory -Path $dossierBackup | Out-Null
}

$count = 0
Get-ChildItem -File | Where-Object {
    $_.Name -ne $liste -and $_.Name -ne (Split-Path $PSCommandPath -Leaf)
} | ForEach-Object {
    if ($utilises -notcontains $_.Name) {
        Move-Item $_.FullName -Destination $dossierBackup
        Write-Host "Deplace (non utilise) : $($_.Name)"
        $count++
    }
}

Write-Host ""
Write-Host "Termine. $count fichier(s) deplace(s) dans $dossierBackup\." -ForegroundColor Green
Write-Host "Verifie ton site : si tout va bien, tu peux supprimer $dossierBackup\ definitivement."
