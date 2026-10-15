#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"
CONFIG_FILE="${BACKUP_CONFIG:-$SCRIPT_DIR/backup.conf}"

[[ -f "$CONFIG_FILE" ]] && source "$CONFIG_FILE"

UPLOADS_DIR="${UPLOADS_DIR:-$SCRIPT_DIR/../backend/uploads}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/lumiere}"
RETENTION="${RETENTION:-7}"
SCHEDULE="${SCHEDULE:-0 3 * * *}"
LOG_FILE="${LOG_FILE:-$BACKUP_DIR/backup.log}"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-1433}"
DB_NAME="${DB_NAME:-biblioteca_comunitaria}"
DB_USER="${DB_USER:-sa}"
DB_PASSWORD="${DB_PASSWORD:-}"

MSSQL_BACKUP_DIR="${MSSQL_BACKUP_DIR:-/var/opt/mssql/backup}"
MSSQL_CONTAINER="${MSSQL_CONTAINER:-}"

CRON_MARKER="# lumiere-backup"
PREFIX="lumiere"

export PATH="/usr/local/sbin:/usr/local/bin:$PATH:/opt/mssql-tools18/bin:/opt/mssql-tools/bin"

usage() {
    cat <<EOF
Usage: $(basename "$0") <command>

Backs up the Lumiere SQL Server database and the uploads folder.

Commands:
  --run-backup   Create a backup archive now and prune old ones.
  --setup        Schedule automatic backups via cron (SCHEDULE="$SCHEDULE").
  --disarm       Remove the scheduled backups.
  --restore      Restore the latest backup (asks for confirmation; add --yes to skip).
  --status       Show schedule, latest backup and recent log lines.
  --help         Show this help.

Configuration (environment variables or $CONFIG_FILE):
  DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD   SQL Server connection.
  MSSQL_BACKUP_DIR   Server-side folder where SQL Server writes .bak files.
  MSSQL_CONTAINER    Docker container name when SQL Server runs in Docker
                     (sqlcmd then runs inside it; DB_HOST/DB_PORT are ignored).
  UPLOADS_DIR        Uploads folder to back up (default: backend/uploads).
  BACKUP_DIR         Where archives are stored (default: /var/backups/lumiere).
  RETENTION          Number of archives to keep (default: 7).
  SCHEDULE           Cron expression used by --setup (default: "0 3 * * *").
EOF
}

log() {
    local line
    line="[$(date '+%Y-%m-%d %H:%M:%S')] [$1] $2"
    echo "$line"
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "$line" >> "$LOG_FILE"
}

fail() {
    log ERROR "$1"
    exit 1
}

work=""
trap 'log ERROR "Failed at line $LINENO: $BASH_COMMAND"' ERR
trap 'rm -rf "$work"' EXIT

sql() {
    [[ -n "$DB_PASSWORD" ]] || fail "DB_PASSWORD is not set."

    if [[ -n "$MSSQL_CONTAINER" ]]; then
        docker exec -e SQLCMDPASSWORD="$DB_PASSWORD" "$MSSQL_CONTAINER" \
            /opt/mssql-tools18/bin/sqlcmd -S localhost -U "$DB_USER" -C -b -Q "$1" >/dev/null
    else
        command -v sqlcmd >/dev/null || fail "sqlcmd not found (install mssql-tools18)."
        SQLCMDPASSWORD="$DB_PASSWORD" sqlcmd -S "$DB_HOST,$DB_PORT" -U "$DB_USER" -C -b -Q "$1" >/dev/null
    fi
}

latest_archive() {
    ls -1t "$BACKUP_DIR"/$PREFIX-*.tar.gz 2>/dev/null | head -n 1 || true
}

run_backup() {
    exec 9>"$BACKUP_DIR/.lock"
    flock -n 9 || fail "Another backup or restore is running."

    local stamp archive bak_name
    stamp="$(date '+%Y%m%d-%H%M%S')"
    work="$(mktemp -d)"
    archive="$BACKUP_DIR/$PREFIX-$stamp.tar.gz"
    bak_name="$PREFIX-$stamp.bak"

    log INFO "Starting backup $stamp"

    sql "BACKUP DATABASE [$DB_NAME] TO DISK = N'$MSSQL_BACKUP_DIR/$bak_name' WITH INIT, CHECKSUM"

    if [[ -n "$MSSQL_CONTAINER" ]]; then
        docker cp "$MSSQL_CONTAINER:$MSSQL_BACKUP_DIR/$bak_name" "$work/database.bak"
        docker exec -u 0 "$MSSQL_CONTAINER" rm -f "$MSSQL_BACKUP_DIR/$bak_name"
    else
        mv "$MSSQL_BACKUP_DIR/$bak_name" "$work/database.bak"
    fi

    if [[ -d "$UPLOADS_DIR" ]]; then
        cp -a "$UPLOADS_DIR" "$work/uploads"
    else
        log WARN "Uploads folder not found: $UPLOADS_DIR"
        mkdir "$work/uploads"
    fi

    (cd "$work" && find . -type f ! -name SHA256SUMS -print0 | xargs -0 sha256sum > SHA256SUMS)
    tar -czf "$archive.tmp" -C "$work" .
    mv "$archive.tmp" "$archive"

    log INFO "Backup created: $archive ($(du -h "$archive" | cut -f1))"

    ls -1t "$BACKUP_DIR"/$PREFIX-*.tar.gz | tail -n +$((RETENTION + 1)) | while read -r old; do
        rm -f "$old"
        log INFO "Pruned old backup: $old"
    done
}

setup() {
    command -v crontab >/dev/null || fail "crontab not found (install cron)."

    local line="$SCHEDULE $SCRIPT_PATH --run-backup > /dev/null 2>> $LOG_FILE $CRON_MARKER"
    { crontab -l 2>/dev/null | grep -v "$CRON_MARKER" || true; echo "$line"; } | crontab -

    log INFO "Backups scheduled: $SCHEDULE"
}

disarm() {
    command -v crontab >/dev/null || fail "crontab not found."

    { crontab -l 2>/dev/null | grep -v "$CRON_MARKER" || true; } | crontab -

    log INFO "Scheduled backups removed."
}

restore() {
    local archive
    archive="$(latest_archive)"
    [[ -n "$archive" ]] || fail "No backup found in $BACKUP_DIR."

    if [[ "${1:-}" != "--yes" ]]; then
        read -r -p "Restore $archive over database '$DB_NAME' and $UPLOADS_DIR? [y/N] " answer
        [[ "$answer" =~ ^[yY]$ ]] || { echo "Aborted."; exit 1; }
    fi

    exec 9>"$BACKUP_DIR/.lock"
    flock -n 9 || fail "Another backup or restore is running."

    local bak_name
    work="$(mktemp -d)"
    bak_name="$PREFIX-restore-$$.bak"

    log INFO "Restoring $archive"

    tar -xzf "$archive" -C "$work"
    (cd "$work" && sha256sum --quiet -c SHA256SUMS) || fail "Checksum verification failed."

    chmod 644 "$work/database.bak"

    if [[ -n "$MSSQL_CONTAINER" ]]; then
        docker cp "$work/database.bak" "$MSSQL_CONTAINER:$MSSQL_BACKUP_DIR/$bak_name"
    else
        cp "$work/database.bak" "$MSSQL_BACKUP_DIR/$bak_name"
    fi

    sql "IF DB_ID(N'$DB_NAME') IS NOT NULL ALTER DATABASE [$DB_NAME] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
         RESTORE DATABASE [$DB_NAME] FROM DISK = N'$MSSQL_BACKUP_DIR/$bak_name' WITH REPLACE, CHECKSUM;
         ALTER DATABASE [$DB_NAME] SET MULTI_USER;"

    if [[ -n "$MSSQL_CONTAINER" ]]; then
        docker exec -u 0 "$MSSQL_CONTAINER" rm -f "$MSSQL_BACKUP_DIR/$bak_name"
    else
        rm -f "$MSSQL_BACKUP_DIR/$bak_name"
    fi

    if [[ -d "$UPLOADS_DIR" ]]; then
        local previous="$UPLOADS_DIR.pre-restore-$(date '+%Y%m%d-%H%M%S')"
        mv "$UPLOADS_DIR" "$previous"
        log INFO "Previous uploads kept at $previous"
    fi
    cp -a "$work/uploads" "$UPLOADS_DIR"

    log INFO "Restore completed from $archive"
}

status() {
    local entry archive count
    entry="$(crontab -l 2>/dev/null | grep "$CRON_MARKER" || true)"
    archive="$(latest_archive)"
    count="$(find "$BACKUP_DIR" -maxdepth 1 -name "$PREFIX-*.tar.gz" | wc -l)"

    if [[ -n "$entry" ]]; then
        echo "Schedule:     armed ($(echo "$entry" | cut -d' ' -f1-5))"
    else
        echo "Schedule:     disarmed"
    fi

    if pgrep -x cron >/dev/null || pgrep -x crond >/dev/null; then
        echo "Cron daemon:  running"
    else
        echo "Cron daemon:  NOT running"
    fi

    echo "Backup dir:   $BACKUP_DIR ($count archives, $(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1) total)"

    if [[ -n "$archive" ]]; then
        local age=$(( ($(date +%s) - $(stat -c %Y "$archive")) / 3600 ))
        echo "Latest:       $archive ($(du -h "$archive" | cut -f1), ${age}h ago)"
    else
        echo "Latest:       none"
    fi

    if [[ -f "$LOG_FILE" ]]; then
        echo "Recent log:"
        tail -n 5 "$LOG_FILE" | sed 's/^/  /'
    fi
}

mkdir -p "$BACKUP_DIR"

case "${1:-}" in
    --run-backup) run_backup ;;
    --setup) setup ;;
    --disarm) disarm ;;
    --restore) restore "${2:-}" ;;
    --status) status ;;
    *) usage ;;
esac
