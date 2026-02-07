---
name: git_ship
description: Safely builds, commits, and pushes changes to GitHub. Use this for deployed projects to ensure stability.
---

# Git Ship Skill

Use this skill to safely ship code to production. It enforces a build check before pushing.

## Usage

1.  **Check Status**: 
    -   Run `git status` to see pending changes.

2.  **Verify Build (CRITICAL)**: 
    -   Run `npm run build`
    -   **IF BUILD FAILS**: STOP IMMEDIATELY. Do not add, commit, or push. You must fix the build errors first.
    -   **IF BUILD SUCCEEDS**: Proceed to the next step.

3.  **Stage Changes**: 
    -   Run `git add .`

4.  **Commit**: 
    -   Generate a concise but descriptive commit message based on the recent changes.
    -   Run `git commit -m "<message>"`

5.  **Push**: 
    -   Run `git push`

6.  **Final Verification**:
    -   Run `git status` to confirm everything is clean and pushed.
