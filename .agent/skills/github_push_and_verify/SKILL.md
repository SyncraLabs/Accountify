---
name: github_push_and_verify
description: Automates the process of adding, committing, pushing, and verifying changes to GitHub.
---

# GitHub Push and Verify Skill

Use this skill whenever you need to push changes to the remote repository. It ensures that all changing are staged, committed, pushed, and then verified.

## Usage
1.  **Check Status**: `git status` to see what's changed.
2.  **Add & Commit**:
    -   If there are uncommitted changes, run `git add .`
    -   Run `git commit -m "<Descriptive Commit Message>"`
    -   *Note*: If you don't have a specific message, ask the user or derive one from the recent changes.
3.  **Push**: Run `git push` (or `git push -u origin <branch>` if upstream isn't set).
4.  **Verify**:
    -   Run `git status` to ensure the branch is clean.
    -   Run `git log -1 --stat` to confirm the commit was recorded.
    -   Run `git diff --stat origin/main` (or relevant branch) to ensure no differences remain if possible, or just rely on the push success message.

## Example Workflow

```bash
git status
git add .
git commit -m "Fixing navigation bug"
git push
git status
git log -1
```
