# Timekeeper CLI

A pure cli version of Timekeeper

Based up on Earthstar 10

Major difference between old Timekeeper will be that the Time Entries will be kept in single file, not separate JSON files.

## To Do

- [x] Set up [Deno project](https://deno.land)
- [x] Design the CLI interface
- [x] Implement the CLI interface -> [cliffy](https://deno.land/x/cliffy)
- [x] Save all confirugration in "settings" -> See `Earthstar.SharedSettings()`
- [x] Ask for existing identity / author -> `scripts/set_author.ts`
- [x] Command for creating identity / author -> `scripts/new_author.ts`
- [x] Ask for share address -> `scripts/add_share.ts`
- [x] Command for create share -> `scripts/new_share.ts`
- [ ] Add sync with peer
- [ ] Copy over main application logic from Timekeeper React version
- [ ] Create command add time entry
- [ ] Create command list time entries
- [ ] Create command delete time entry
- [ ] Create command delete multiple time entries
- [ ] Create command edit time entry
- [ ] Create command filter time entry by week
- [ ] Create command summary of total hours worked by tag
- [ ] Create command summary of total hours worked by tag and per week