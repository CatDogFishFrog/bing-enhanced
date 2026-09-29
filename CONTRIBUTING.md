# Contributing

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) so CI can validate messages and git-cliff can group user-facing changes in GitHub Release notes.

When dependencies are installed with `npm ci` or `npm install`, Husky installs a local `commit-msg` hook that runs Commitlint. This checks the message before Git creates the commit. CI repeats the validation for pull requests and pushes. This is a message-format check, not a cryptographic signature.

```text
<type>(<optional-scope>): <short description>

<optional context>

<optional footer>
```

Write the type and scope in lowercase English. Keep the subject short, specific, and focused on the user-visible effect. Use the imperative form and omit the final period. A scope is optional; prefer an area such as `settings`, `search`, `videos`, or `release`.

Good examples:

```text
feat(videos): open TikTok results directly on TikTok
fix(settings): keep the selected language after reload
perf(search): avoid rescanning unchanged results
chore(release): prepare v0.5.2
```

Avoid vague subjects such as `update`, `fix stuff`, or a list of files. Make separate commits for unrelated changes where practical.

### Commit types

- `feat`: a user-facing feature; included under **Features** and normally calls for a minor version bump.
- `fix`: a user-facing bug fix; included under **Bug Fixes** and normally calls for a patch bump.
- `perf`: a user-visible performance improvement; included under **Performance**.
- `docs`, `test`, `ci`, `build`, `style`, `chore`, `refactor`, and `deps`: maintenance work, omitted from user-facing release notes.
- Other valid Conventional Commit types appear under **Other Changes**. Prefer `feat`, `fix`, or `perf` when the change affects users.

The commit type is a versioning cue, not an automatic version bump. The release version remains manually controlled in `package.json`.

### Breaking changes

Mark a breaking change with `!` after the type or scope, and explain its impact in a `BREAKING CHANGE:` footer:

```text
feat(settings)!: remove the legacy tab-opening option

BREAKING CHANGE: saved preferences for the removed option are ignored.
```

Breaking changes are retained and marked in release notes even if their type would normally be omitted.

Use `Fixes #123` or `Refs #123` footers when a GitHub issue is relevant.

## Releases

1. Make conventional commits for the changes that should appear in release notes.
2. Run `npm run check`.
3. Update `version` in `package.json` using SemVer: `feat` normally means minor, `fix` normally means patch, and a breaking change normally means major.
4. Commit the version change, for example `chore(release): prepare v0.5.2`.
5. Push the commit and a matching `v*` tag.

GitHub Actions checks commit messages against the latest release, builds the userscript, and generates categorized notes for the commits between the new tag and the previous tag. It then publishes the userscript and those notes together as a GitHub Release. No separate `CHANGELOG.md` is maintained; GitHub Release notes are the user-facing changelog.
