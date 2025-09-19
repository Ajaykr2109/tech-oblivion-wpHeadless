@echo off
echo Running Analytics Database Diagnostic and Repair Tool...
echo.

REM Run the database repair tool
php "wp-fe\mu-plugins\_devtools\fix_analytics_db.php"

echo.
echo Database repair completed. Running verification...
echo.

REM Run the table check to verify everything is working
php "wp-fe\mu-plugins\_devtools\db_table_check.php"

echo.
echo Verification completed.
pause