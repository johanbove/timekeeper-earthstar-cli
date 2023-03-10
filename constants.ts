// @ts-ignore TS2305
import { DateTime } from "npm:luxon@3";

export const LOCALE = "de-DE"; // Used for date formatting
export const NAMESPACE = "TimeKeeperV2";
export const APPNAME = "timekeeper";
export const VERSION = "1.14.0";
export const FORMAT_VERSION = "1.0";

export const FORMAT_ABOUT_VERSION = "1.0";
export const ABOUT_FOLDER = `/about/${FORMAT_ABOUT_VERSION}/`;

export const ENTRIES_FOLDER = `/${APPNAME}/${FORMAT_VERSION}/entries/`;
export const JOURNAL_FOLDER = `/${APPNAME}/${FORMAT_VERSION}/journal/`;

export const DESCRIPTION = `
This application gives you control over an Earthstar share.

> What is Earthstar? <http://earthstar-project.org>

You can store any kind of doc within the share, but the main purpose is for tracking time you work on a project and tasks.

This app is specifically designed to keep track of projects.

When you first install the app you will need to do two things.

    1. Create a new Earthstar author or enter an existing author address and secret:

        $ deno run -A ./timekeeper.ts author:set 
        
        OR create a new author if you don't have one yet.:
        
        $ deno run -A ./timekeeper.ts author:new 

    2. Create a new Earthstar share or enter an existing share address and secret.

        $ deno run -A ./timekeeper.ts share:add 

        OR create a brand new share:

        $ deno run -A ./timekeeper.ts share:new 

When you restart the app after adding your credentials and share address you will get a menu of options.

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
