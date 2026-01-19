@echo off
echo ===================================================
echo     PUBLICATION AUTOMATIQUE - ANTHONY COURTIN
echo ===================================================
echo.
echo 1. Ajout des nouveaux fichiers...
git add .

echo.
echo 2. Enregistrement des modifications (Commit)...
git commit -m "Auto-publication: Mise a jour du contenu"

echo.
echo 3. Envoi vers Netlify (Push)...
git push

echo.
echo ===================================================
echo     PUBLICATION TERMINEE AVEC SUCCES !
echo ===================================================
echo.
echo Votre site sera mis a jour sur Netlify dans quelques instants.
echo.
pause
