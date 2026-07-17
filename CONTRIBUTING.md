# Contributing — conoceme-aun-mas

Public portfolio-game. Contributions from the owner and agents follow the same path.

## Workflow

```text
main (protected by convention)
  ↑
  PR review + checks
  ↑
  feature branch
```

1. `git checkout main && git pull`
2. `git checkout -b feat/my-change`
3. Implement + update docs if needed
4. `git push -u origin HEAD`
5. `gh pr create` with a clear description
6. Review (human and/or agent), address feedback
7. Merge (squash preferred for clean history)

## Local setup (after scaffold PR)

```bash
npm install
npm run dev
```

(Exact scripts land in the scaffold PR.)

## Code style

- TypeScript strict  
- Prefer clear names over cleverness  
- UI/game code: separate **shell**, **game**, **content**, **ui**  
- Assets: optimized; name files by domain (`player-walk.png`, `zone-rambla-bg.webp`)

## Commit messages

Conventional Commits:

```
feat(shell): add title scroll sequence
fix(game): joystick dead zone on iOS
docs: update zone map in DESIGN
```

## Review bar

A PR is ready when:

- Intention is obvious from title + description  
- It doesn’t regress mobile input or intro motion  
- It doesn’t dump unrelated refactors  
- Design docs stay in sync with reality  

## Code of presence

This project should feel **Uruguayan, crafted, and playable**.  
If a change makes it look like a default template, rewrite it.
