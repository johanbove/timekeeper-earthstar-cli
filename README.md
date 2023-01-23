# Timekeeper CLI

A pure cli version of Timekeeper.

Powered by [Deno](https://deno.land) and [Earthstar Project](https://github.com/earthstar-project/earthstar)!

## Notes

Major difference between old Timekeeper and this version is that the "Time Entries" will be kept in single _doc_, not separate JSON files.
Encountered some issues with syncing many files within a single folder with the latest version of EarthStar.

## Journal

### 2022-01-23, Monday

- Started building this CLI for my next version of TimeKeeper. Inspired by [EarthStar Project's "User Scripts"](https://github.com/earthstar-project/user_scripts).
- Got the initial CLI working and I've set up the initial menu. EarthStar share and identity works.

## Plans

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

---