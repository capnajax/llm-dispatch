#!/bin/bash

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

doList=()
doPrettier=true

paramError=false
for arg in "$@"; do
  case "$arg" in
  --do-clamps)
    doList+=('clamps')
    ;;
  --do-error-codes)
    doList+=('error-codes')
    ;;
  --do-openai)
    doList+=('openai')
    ;;
  --no-prettier)
    doPrettier=false
    ;;
  *)
    echo "Unknown parameter $arg"
    paramError=true;
  esac
done
if $paramError; then exit 1; fi

doThing() {
  if [ '0' = "${#doList[@]}" ]; then return 0; fi
  for thing in "${doList[@]}"; do
    if [ "$thing" = "$1" ]; then
      return 0
    fi
  done
  return 1
}

cd "${DIR}" || exit 1
mkdir -p ../generated

echo "Running code generator"

if doThing 'openai'; then
  echo
  echo "[openai]: converting schemas in swagger to TS types and validators"
  echo
  tsx --enable-source-maps openai.ts openai.yaml ../generated/openai-types
  if $doPrettier; then
    echo "Running Prettier"

    npx prettier --parser typescript --config "${DIR}/.prettierrc" \
      --write ../generated/openai-types.ts
  fi

  tsx --enable-source-maps clamps.ts \
    ../generated/openai-types.ts ../generated
  if $doPrettier; then
    npx prettier --parser typescript --config "${DIR}/.prettierrc" \
      --write ../generated/openai-types-clamps.ts
  fi
fi

if doThing 'error-codes'; then
  echo
  echo "[error-codes] Building error codes types and constants"
  echo
  tsx --enable-source-maps error-codes.ts \
    error-codes.yaml ../generated/error-codes
fi

if doThing 'clamps'; then
  echo
  echo "[clamps] Building typeguards, asserts, and non-clamping tests from" \
    "validators and types"
  echo
  tsx --enable-source-maps clamps.ts ../validators ../generated
fi

echo
echo "$0" "$*" "done"
