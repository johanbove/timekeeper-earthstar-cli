# Timekeeper CLI

**A pure cli version of Timekeeper.**

Powered by [Deno](https://deno.land), [Cliffy](https://deno.land/x/cliffy) and [Earthstar Project](https://github.com/earthstar-project/earthstar)

## Design Notes

### Time Entries

Major difference between old Timekeeper and this version is that the "Time Entries" will be kept in single _doc_, not separate JSON files.

Any author can edit and add to the time entries. This allows for delegation and being able to help each other fixing their time entries.

Encountered some issues with syncing many files within a single folder with the latest version of EarthStar.

The _doc_ will be stored in the path `/entries/{yyyy}-{mm}`.

Every month will start a new _doc_.

Each line in the path will consist of a tab separated time entry:

    {timestamp}\t{action}\t{tag}\t{comment}

| Key       | Description                        |
|-----------|------------------------------------|
| timestamp | unix epoch seconds                 |
| action    | START or STOP                      |
| tag       | aka Project or recurring task      |
| comment   | Short description for more context |

### Display Name and Status

The "display name" and "status" docs can only be edited by the active author.

See:

- `/about/~@{authorAddress}/displayName`
- `/about/~@{authorAddress}/status`

### Journal Entries

The app should allow the user to keep a journal.

Any author can update the "journal" to allow for collaboration.

Journal entries are organised in a single doc.

The _doc_ will be stored in the path `/journal/{yyyy}-{mm}`.

Every month will start a new _doc_.

Each line in the path will consist of a tab separated time entry:

    {timestamp}\t{entry}

## Journal

### 2022-01-23, Monday

- Started building this CLI for my next version of TimeKeeper.
- Inspired by [EarthStar Project's "User Scripts"](https://github.com/earthstar-project/user_scripts).
- Got the initial CLI working and I've set up the initial menu.
- EarthStar share and identity works.
- Working on this _README_ to flesh out the plans and create useful documentation.

## Plans

- [x] Set up [Deno project](https://deno.land)
- [x] Design the CLI interface
- [x] Implement the CLI interface -> [cliffy](https://deno.land/x/cliffy)
- [x] Save all confirugration in "settings" -> See `Earthstar.SharedSettings()`
- [x] Ask for existing identity / author -> `scripts/set_author.ts`
- [x] Command for creating identity / author -> `scripts/new_author.ts`
- [x] Ask for share address -> `scripts/add_share.ts`
- [x] Command for create share -> `scripts/new_share.ts`
- [x] Create command to set displayName
- [x] Create command to set status
- [x] Add auto-complete path suggestions for "read a document"
- [x] Add "show status"
- [x] Add "show displayname"
- [x] Add journal entries
- [x] Add wiping documents
- [x] Create command add time entry
- [x] Create command list time entries
- [ ] Create command delete time entry
- [x] Create command delete multiple time entries
- [ ] Create command edit time entry
- [ ] Create command filter time entry by week
- [ ] Create command summary of total hours worked by tag
- [ ] Create command summary of total hours worked by tag and per week
- [ ] Add [cliffy "command"](https://cliffy.io/docs@v0.25.7/command) for command-line actions
- [ ] Add sync with peer

---