@echo off
echo Starting Movie Service Backend...
echo.
set "MAVEN_BIN=%~dp0movie-service\maven\apache-maven-3.9.6\bin"
set "PATH=%MAVEN_BIN%;%PATH%"

cd movie-service
call mvn spring-boot:run
