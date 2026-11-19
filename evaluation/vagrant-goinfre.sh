#!/usr/bin/env bash
set -euo pipefail

P3_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GOINFRE="/goinfre/${USER:-vgoret}"

mkdir -p "$GOINFRE/.vagrant-home" "$GOINFRE/.vagrant-tmp" "$GOINFRE/VMs"

export VAGRANT_HOME="$GOINFRE/.vagrant-home"
export TMPDIR="$GOINFRE/.vagrant-tmp"

VBoxManage setproperty machinefolder "$GOINFRE/VMs"

cd "$P3_DIR"
exec vagrant "$@"
