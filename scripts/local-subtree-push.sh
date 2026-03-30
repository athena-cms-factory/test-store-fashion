#!/bin/bash

# Configuration
TARGET_ORG="athena-cms-factory"
REMOTE_ALIAS="github-athena"
BRANCH="main"
LOG_FILE="batch-sync-$(date +%Y%m%d-%H%M%S).log"

echo "🔱 Starting Batch Sync to $TARGET_ORG..." | tee -a "$LOG_FILE"
echo "📅 Date: $(date)" | tee -a "$LOG_FILE"

# Function to push a subtree
push_site() {
    local site_path=$1
    local site_name=$(basename "$site_path")
    local prefix=$site_path
    local target_repo="$TARGET_ORG/$site_name"

    echo "----------------------------------------" | tee -a "$LOG_FILE"
    echo "📍 Processing Site: $site_name ($prefix)" | tee -a "$LOG_FILE"

    # Step 1: Split subtree to get a commit SHA
    echo "  Split subtree..." | tee -a "$LOG_FILE"
    SPLIT_SHA=$(git subtree split --prefix="$prefix" "$BRANCH" 2>>"$LOG_FILE")
    
    if [ -z "$SPLIT_SHA" ]; then
        echo "  ❌ Failed to split subtree for $site_name" | tee -a "$LOG_FILE"
        return 1
    fi

    # Step 2: Push SHA to target repo
    echo "  Pushing to $target_repo..." | tee -a "$LOG_FILE"
    if git push "$REMOTE_ALIAS:$target_repo.git" "$SPLIT_SHA:refs/heads/main" --force 2>>"$LOG_FILE"; then
        echo "  ✅ Success: $site_name pushed to $target_repo" | tee -a "$LOG_FILE"
    else
        echo "  ❌ Failed: $site_name could not be pushed" | tee -a "$LOG_FILE"
    fi
}

# Main Loop
# 1. Sites
for d in sites/*/; do
    [ -d "$d" ] || continue
    push_site "${d%/}"
done

# 2. External Sites
for d in sites-external/*/; do
    [ -d "$d" ] || continue
    push_site "${d%/}"
done

echo "=========================================" | tee -a "$LOG_FILE"
echo "🏁 Batch Sync Completed at $(date)" | tee -a "$LOG_FILE"
