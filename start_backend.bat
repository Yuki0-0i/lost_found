@echo off
setlocal
set "JAVA_HOME=%~dp0tools\jdk-17.0.19+10"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "MAVEN_HOME=%~dp0tools\apache-maven-3.9.6"
set "PATH=%MAVEN_HOME%\bin;%PATH%"
echo Starting Spring Boot backend...
cd /d "%~dp0lost_found_backend"
mvn spring-boot:run
