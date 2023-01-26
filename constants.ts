import { DateTime } from "npm:luxon@3";

export const NAMESPACE = 'TimeKeeperV2';
export const APPNAME = "timekeeper";
export const VERSION = "1.6.0";
export const DESCRIPTION = `
This application gives you control over an Earthstar share.
You can store any documents within the share.
This app is specifically designed to keep track of projects.
When you first install the app you will need to do two things.

    1. Create a new Earthstar author or enter an existing author address and secret.

        $ deno run -A ./scripts/new_author.ts
        $ deno run -A ./scripts/set_author.ts

    2. Create a new Earthstar share or enter an existing share address and secret.

        $ deno run -A ./scripts/new_share.ts
        $ deno run -A ./scripts/add_share.ts

When you restart the app after adding your credentials and share address you will get a menu of options.

See the "./scripts" folder for utility scripts that allow you to work with the Earthstar star.

This application comes with absolutely no warranty! Use at your own risk.

`;
/**
 * Temporary hard-coded until parsing from previous time entries works.
 */
export const TAGS = ['Deloitte','BMW','Counseling','Training'];
/**
 * Temporary hard-coded until parsing from previous time entries works.
 */
export const COMMENTS = ['Meeting','Travel'];

export const DAYSOFTHEWEEK = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export const thisYear = new Date().toLocaleString("default", { year: "2-digit" });
export const thisWeekNumber = DateTime.now().weekNumber;
export const thisWeekId = `${thisYear}/${thisWeekNumber}`;