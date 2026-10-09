$ErrorActionPreference = 'Stop'

$postgresRoot = Join-Path $env:ProgramFiles 'PostgreSQL'
$psqlCommand = Get-Command psql.exe -ErrorAction SilentlyContinue
if ($psqlCommand) {
  $psqlPath = $psqlCommand.Source
} else {
  $psqlPath = Get-ChildItem -Path $postgresRoot -Filter psql.exe -File -Recurse -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending |
    Select-Object -First 1 -ExpandProperty FullName
}

if (-not $psqlPath) {
  throw 'PostgreSQL psql.exe was not found. Install PostgreSQL or add its bin folder to PATH.'
}

$adminUser = Read-Host 'PostgreSQL administrator username (default: postgres)'
if ([string]::IsNullOrWhiteSpace($adminUser)) {
  $adminUser = 'postgres'
}

$secureAdminPassword = Read-Host 'PostgreSQL administrator password' -AsSecureString
$passwordPointer = [IntPtr]::Zero
$plainAdminPassword = $null

try {
  $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureAdminPassword)
  $plainAdminPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  $env:PGPASSWORD = $plainAdminPassword

  & $psqlPath -h 127.0.0.1 -p 5432 -U $adminUser -d postgres -w -v ON_ERROR_STOP=1 -c 'SELECT 1' | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not authenticate to local PostgreSQL. Check the administrator username and password.'
  }

  $randomBytes = New-Object byte[] 32
  $randomGenerator = [Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $randomGenerator.GetBytes($randomBytes)
  } finally {
    $randomGenerator.Dispose()
  }
  $appPassword = [BitConverter]::ToString($randomBytes).Replace('-', '').ToLowerInvariant()

  $roleSql = "DO `$role_setup`$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'atelier_app') THEN ALTER ROLE atelier_app WITH LOGIN PASSWORD '$appPassword'; ELSE CREATE ROLE atelier_app LOGIN PASSWORD '$appPassword'; END IF; END `$role_setup`$;"
  & $psqlPath -h 127.0.0.1 -p 5432 -U $adminUser -d postgres -w -v ON_ERROR_STOP=1 -c $roleSql | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not create the local Atelier North database role.'
  }

  $createdbPath = Join-Path (Split-Path $psqlPath -Parent) 'createdb.exe'
  foreach ($databaseName in @('atelier_north', 'atelier_north_shadow')) {
    $existingDatabase = & $psqlPath -h 127.0.0.1 -p 5432 -U $adminUser -d postgres -w -v ON_ERROR_STOP=1 -Atc "SELECT 1 FROM pg_database WHERE datname = '$databaseName'"
    if ($LASTEXITCODE -ne 0) {
      throw "Could not check for the $databaseName database."
    }

    if ($existingDatabase -notcontains '1') {
      & $createdbPath -h 127.0.0.1 -p 5432 -U $adminUser -w -O atelier_app $databaseName
      if ($LASTEXITCODE -ne 0) {
        throw "Could not create the $databaseName database."
      }
    } else {
      & $psqlPath -h 127.0.0.1 -p 5432 -U $adminUser -d postgres -w -v ON_ERROR_STOP=1 -c "ALTER DATABASE $databaseName OWNER TO atelier_app" | Out-Null
      if ($LASTEXITCODE -ne 0) {
        throw "Could not assign the $databaseName database to its local application role."
      }
    }

    & $psqlPath -h 127.0.0.1 -p 5432 -U $adminUser -d $databaseName -w -v ON_ERROR_STOP=1 -c 'ALTER SCHEMA public OWNER TO atelier_app; GRANT ALL ON SCHEMA public TO atelier_app' | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "Could not configure the public schema in $databaseName."
    }
  }

  $projectRoot = Split-Path $PSScriptRoot -Parent
  $envPath = Join-Path $projectRoot '.env'
  $envLines = @()
  if (Test-Path $envPath) {
    $envLines = @(Get-Content -Path $envPath | Where-Object { $_ -notmatch '^\s*(DATABASE_URL|SHADOW_DATABASE_URL)\s*=' })
  }
  $envLines += "DATABASE_URL=`"postgresql://atelier_app:$appPassword@127.0.0.1:5432/atelier_north?schema=public`""
  $envLines += "SHADOW_DATABASE_URL=`"postgresql://atelier_app:$appPassword@127.0.0.1:5432/atelier_north_shadow?schema=public`""
  $utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
  [IO.File]::WriteAllLines($envPath, [string[]]$envLines, $utf8WithoutBom)

  Write-Output 'Local PostgreSQL is ready for Atelier North. The connection string was saved to the ignored .env file.'
} finally {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  if ($passwordPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  }
  if ($secureAdminPassword) {
    $secureAdminPassword.Dispose()
  }
  $plainAdminPassword = $null
}
