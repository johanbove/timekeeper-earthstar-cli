# Timekeeper CLI

**A pure cli version of Timekeeper.**

Powered by [Deno](https://deno.land), [Cliffy](https://deno.land/x/cliffy) and
[Earthstar Project](https://github.com/earthstar-project/earthstar)

## Repository

- <https://git.murphy-bove.net/gitea/johan/timekeeper-earthstar-cli>

## Design Notes

### The Scripts

These are copied over from
[the Earthstar-project "user_scripts" project](https://github.com/earthstar-project/user_scripts).

### Time Entries

See [SPEC_1.1.md](./SPEC_1.1.md) for formal "timekeeper" spec.

The "Time Entries" will be kept in single _doc_ for every month, next to keeping
the entries within a author-only editable folder, where each entry will be saved
as an individual file.

Any author can edit and add to the time entries in the monthy overview. This
allows for delegation and being able to help each other fixing their time
entries. Making edits however will create conflicts with the author's entries
and will have to be resolved.

The _doc_ will be stored in the path `/timekeeper/1.0/entries/{yyyy}-{mm}`.

Every month will start a new _doc_.

Each line in the path will consist of a tab separated time entry:

    {timestamp}\t{action}\t{tag}\t{comment}

| Key       | Description                        |
| --------- | ---------------------------------- |
| timestamp | unix epoch seconds                 |
| action    | START or STOP                      |
| tag       | aka Project or recurring task      |
| comment   | Short description for more context |

Except for the author specific files where the _timestamp_ field will be taken
from the doc path instead.

The contents of a author-specific entry will therefor be:

    {action}\t{tag}\t{comment}

### Display Name and Status

The "display name" and "status" docs can only be edited by the active author.

See:

- `/about/1.0/~@{authorAddress}/displayName`
- `/about/1.0/~@{authorAddress}/status`

### Journal Entries

See [SPEC_1.1.md](./SPEC_1.1.md) for formal "timekeeper" spec.

The app should allow the user to keep a journal.

Journal entries are organised in a single doc, next to keeping the journal
entries within a author-only editable folder, where each entry will be saved as
an individual file.

Any author can edit the "journal" to allow for collaboration. This allows for
delegation and being able to help each other fixing their time entries. Making
edits however will create conflicts with the author's entries and will have to
be resolved.

The _doc_ will be stored in the path `/timekeeper/1.0/journal/{yyyy}-{mm}`.

Every month will start a new _doc_.

Each line in the path will consist of a tab separated time entry:

    {timestamp}\t{entry}

Except for the author specific files where the _timestamp_ field will be taken
from the doc path instead.

The contents of a author-specific entry will therefor be:

    {entry}

## Usage

All commands require the Earthstar to be predefined using the "`-s`" parameter.
If the share is unknown, the application will show the list of know known shares
to save the data in.

> **TIP** Get all commands using the `timekeeper -h` command.

You can set the "status" directly through the command line:

deno run -A ./timekeeper.ts status -s +test1.biyrxx.... -e "Checking out
Timekeeper cli"

You can add a "time entry" through the command line:

deno run -A ./timekeeper.ts start -s +test1.biyrxx.... -t "TEST" -c "Testing
Timekeeper cli"

Reading the journal:

    deno run -A timekeeper.ts -s +test1.biyrxx.... journal

Setting the status from the command line:

    deno run -A timekeeper.ts -s +test1.biyrxx.... status -e "Happy that it worked"

> **NOTE** Escape special characters like "!". Escape with a back slash, eg.
> `\!`

It is possible to use "timekeeper" after creating an alias in your terminal, for
quicker access.

For example:

```bash
$ which timekeeper
$ timekeeper: aliased to deno run -A ~/Dev/EarthstarProject/timekeeper-earthstar-cli/timekeeper.ts -s +test1.biyrxx...
```

### Example bash aliases

Add these to your `~/.profile` file for quick ways of working with cli.

Note that we have predefined the share _+test1.biyrxx72..._ to be the active one
for all our further commands.

```bash
export timekeeperclidir=~/Dev/EarthstarProject/timekeeper-earthstar-cli/
alias timekeeper='deno run -A $timekeeperclidir/timekeeper.ts -s +test1.biyrxx72...'
alias tjournal='timekeeper journal'
alias tstatus='timekeeper status'
alias tstart='timekeeper start'
alias tstop='timekeeper stop'
alias tsync='timekeeper sync:dir'
alias treport='timekeeper report'
alias tsyncs='deno run -A $timekeeperclidir/scripts/sync_all.ts'
```

It is now possible to call the sync right from Timekeeper itself.

    $ timekeeper sync:dir

This will copy all files to the "./data" folder.

### Running the user scripts

Sync with the local file system:

    deno run -A ./scripts/sync_dir.ts

Sync with the server:

    deno run -A ./scripts/sync_with_server.ts

Sync with all servers:

    deno run -A ./scripts/sync_all.ts

## Journal

## 2023-02-16, Thursday

- Introduced integration tests; figuring out how deno testing works.
- See tasks in `deno.json`

## 2023-02-10, Friday

- Now following the correct
  ["about"](https://github.com/earthstar-project/application-formats/blob/main/formats/about/SPEC_1.0.md)
  [format spec](https://github.com/earthstar-project/application-formats).
- Introduces the ["timekeeper" format spec version 1.0](./SPEC_1.0.md).
- This will change the structure of your existing timekeeper data.

## 2023-02-07, Tuesday

- Updates to this documentation and some new additions to the command line have
  appeared.

## 2023-01-24, Tuesday

- Got the cli working!
- Added the "user_scripts" repo as a Git submodule but cannot run the scripts
  because the "settings" won't be shared with the main app. So the files are
  here for easy access, not to be called directly.

### 2023-01-23, Monday

- Started building this CLI for my next version of TimeKeeper.
- Inspired by
  [EarthStar Project's "User Scripts"](https://github.com/earthstar-project/user_scripts).
- Got the initial CLI working and I've set up the initial menu.
- EarthStar share and identity works.
- Working on this _README_ to flesh out the plans and create useful
  documentation.

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
- [x] Create command delete multiple time entries
- [x] Add parsing the list of existing tags to time entry command
- [x] Create command to add time entry
- [ ] Create command delete time entry
- [ ] Create command edit time entry
- [ ] Create command filter time entry by week
- [ ] Create command summary of total hours worked by tag
- [ ] Create command summary of total hours worked by tag and per week
- [x] Add [cliffy "command"](https://cliffy.io/docs@v0.25.7/command) for
      command-line actions
- [x] Add sync with peer
- [x] Add export to data
- [x] Add export to zip
- [ ] Add integration tests
- [x] Add Time Report for current month
- [x] Refine onboarding with new author and new share
- [x] Add clearing of settings command
- [x] Fix the folder structure missing the version number according to a format
      spec
- [ ] Add functionality to create a new author key
- [ ] Add functionality to create a new share
- [ ] Add functionality to create a zip archive

---
