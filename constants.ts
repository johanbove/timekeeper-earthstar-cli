import { DateTime } from "npm:luxon@3";

export const LOCALE = 'de'; // Used for date formatting
export const NAMESPACE = "TimeKeeperV2";
export const APPNAME = "timekeeper";
export const VERSION = "1.9.0";
export const DESCRIPTION = `
This application gives you control over an Earthstar share.

> What is Earthstar? <http://earthstar-project.org>

You can store any documents within the share.

This app is specifically designed to keep track of projects.

When you first install the app you will need to do two things.

    1. Create a new Earthstar author or enter an existing author address and secret.

        $ deno run -A ./scripts/new_author.ts
        
        OR
        
        $ deno run -A ./scripts/set_author.ts

    2. Create a new Earthstar share or enter an existing share address and secret.

        $ deno run -A ./scripts/new_share.ts

        OR

        $ deno run -A ./scripts/add_share.ts

When you restart the app after adding your credentials and share address you will get a menu of options.

See the "./scripts" folder for utility scripts that allow you to work with the Earthstar star.

This application comes with absolutely no warranty! Use at your own risk.

Timekeeper Earthstar CLI
Copyright (C) 2023 Johan Bové

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

`;
/**
 * Temporary hard-coded until parsing from previous time entries works.
 */
export const TAGS = ["Deloitte", "BMW", "Counseling", "Training"];
/**
 * Temporary hard-coded until parsing from previous time entries works.
 */
export const COMMENTS = ["Meeting", "Travel"];

export const DAYSOFTHEWEEK = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export const thisYear = new Date().toLocaleString("default", {
  year: "2-digit",
});
export const thisWeekNumber = DateTime.now().weekNumber;
export const thisWeekId = `${thisYear}/${thisWeekNumber}`;