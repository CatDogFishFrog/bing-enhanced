# Як робити коміти та релізи

[English version](CONTRIBUTING.md)

## Формат комітів

Використовуй [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Коли залежності встановлюються через `npm ci` або `npm install`, Husky додає локальну перевірку повідомлення перед створенням коміту. CI повторно перевіряє повідомлення у pull request-ах та push-ах. Це перевірка формату тексту, а не криптографічний підпис коміту.

```text
<type>(<необов'язковий-scope>): <короткий опис англійською>

<необов'язкове пояснення>

<необов'язковий footer>
```

Тип, scope та опис пиши англійською. Використовуй малі літери, короткий конкретний опис зміни та не став крапку в кінці. Scope необов'язковий і називає частину проєкту: наприклад, `settings`, `search`, `videos` або `release`.

```text
feat(videos): open TikTok results directly on TikTok
fix(settings): keep the selected language after reload
perf(search): avoid rescanning unchanged results
docs(readme): clarify navigation between Bing sections
chore(release): prepare v0.5.2
```

Не використовуй загальні повідомлення на кшталт `update`, `fix stuff` чи просто перелік файлів. Не поєднуй не пов'язані зміни в одному коміті, якщо їх можна розділити.

## Типи змін

- `feat`: нова функція для користувача; секція **Features**, зазвичай minor bump.
- `fix`: виправлення помилки; секція **Bug Fixes**, зазвичай patch bump.
- `perf`: помітне покращення швидкодії; секція **Performance**.
- `feat!`, `fix!` або footer `BREAKING CHANGE:` позначає несумісну зміну; її буде виділено в нотатках, зазвичай потрібен major bump.
- `docs`, `test`, `ci`, `build`, `style`, `chore`, `refactor` і `deps` вважаються технічними змінами й не потрапляють до користувацьких нотаток релізу.
- Інші conventional типи потрапляють до **Other Changes**. Для помітних користувачу змін використовуй `feat`, `fix` або `perf`.

Тип коміту підказує SemVer bump, але не змінює версію автоматично. Версією керує поле `version` у `package.json`.

### Несумісні зміни

Постав `!` після типу чи scope та поясни наслідок у footer:

```text
feat(settings)!: remove the legacy tab-opening option

BREAKING CHANGE: saved preferences for the removed option are ignored.
```

Для пов'язаної GitHub issue можна додати footer `Fixes #123` або `Refs #123`.

## Випуск релізу

1. Зроби conventional commits для змін, які мають з'явитися в нотатках релізу.
2. Запусти `npm run check`.
3. Онови `version` у `package.json` за SemVer: `feat` зазвичай minor, `fix` patch, несумісна зміна major.
4. Зафіксуй нову версію комітом, наприклад `chore(release): prepare v0.5.2`.
5. Створи й запуш тег із тією самою версією, наприклад `v0.5.2`.

Husky перевіряє повідомлення перед створенням коміту; CI додатково перевіряє PR і push. Після push тегу Actions формує нотатки з комітів після попереднього тегу й додає їх до GitHub Release разом із `bing-enhanced.user.js`. Окремий `CHANGELOG.md` не ведеться: користувацький список змін міститься в нотатках GitHub Release.