// https://deno.land/manual@v1.29.4/node/npm_specifiers
import { DateTime, Interval } from "npm:luxon@3";
import { fromDate as DotBeatTimeFromDate } from "npm:dot-beat-time";
import { TAGS, COMMENTS } from "../../constants.ts";
import { Earthstar, Input, Table, Select } from "../../deps.ts";
import { getTimeEntriesMonthDocPath } from "../utils/index.ts";
import { edit, read } from "../documents/index.ts";

export enum actions { START = 'START', STOP = 'STOP' }

/**
 * This is equivalent to:
 * type Actions =  'START' | 'STOP';
 */
type Actions = keyof typeof actions;

interface TimeSeriesEntry {
    [key: string]: { duration: number }
}

interface TimeSeriesReport {
    [key: string]: {
        duration: number,
        weeks?: TimeSeriesEntry
    }
}

interface TimeEntry {
    BeatTime: string,
    previousBeatTime?: string,
    durationBeats: number,
    weekId: string,
    weekDayId: string,
    weekNumber: number,
    key: string,
    timestamp: Date,
    status: string,
    action: Actions,
    durationMinutes: number,
    durationHours: number,
    previousDay: string | null,
    currentDay: string,
    nextDay: string | null,
    comment?: string,
    title: string | number,
    tag?: string,
}

interface Entry {
    action: string,
    tag?: string,
    comment?: string
}

interface EntryData {
    [key: string]: Entry;
}

interface StatisticsProps {
    currentWeekId: string,
    weeks: {
        [key: string]: { duration: number }
    },
    totalHours: number,
    tagsTotalDuration: number,
    days: TimeSeriesReport,
    entries: string[],
    tags: TimeSeriesReport
}

interface ThisWeekReportProps {
    currentWeekId: string,
    currentWeekNumber: number,
    tagsPerWeek: TimeSeriesReport,
    weekDays: TimeSeriesReport,
    tagsPerDay: TimeSeriesReport,
    tags: TimeSeriesReport,
    year?: number
}

interface TimeEntriesProps {
    parsedEntries: TimeEntry[],
    days: TimeSeriesReport,
}

interface DailyFlowProps {
    currentWeekId: string,
    currentWeekNumber: number,
    parsedEntries: TimeEntry[],
}

/**
 * Gets details for a specific entry. This is a service actually.
 * @param {*} _data
 * @param {*} key
 * @returns
 */
function getEntryData(_data: EntryData, key: string) {
    const timestamp = new Date(parseInt(key, 10));
    const action = _data[key]["action"];
    const tag = _data[key]["tag"];
    const comment = _data[key]["comment"];
    return { timestamp, action, tag, comment };
}

/**
 * Parses through the time entries and creates a usable construct for further data rendering.
 * 
 * `_data[parseInt(timestamp, 10) * 1e3] = JSON.parse(entry.content);`
 * 
 * @param _data EntryData 
 * @param weekNumber number
 * @param year string Two digit year (not expecting this app to last over a hundred years...)
 * @returns 
*/
const parseTimeEntries = (_data: EntryData, weekNumber?: number, year?: number) => {

    // Newest first
    const entries = Object.keys(_data).sort().reverse();

    if (!entries.length) {
        return null;
    }

    const weeks: TimeSeriesReport = {};
    const weekDays: TimeSeriesReport = {};
    const days: TimeSeriesReport = {};
    const tags: TimeSeriesReport = {};
    const tagsPerWeek: TimeSeriesReport = {};
    const tagsPerDay: TimeSeriesReport = {};

    let totalHours = 0;

    /**
     * @example 22
     */
    const currentYear = year || new Date().toLocaleString("default", { year: "2-digit" });
    const currentWeekNumber = weekNumber || DateTime.now().weekNumber;
    const currentWeekId = `${currentYear}/${currentWeekNumber}`;

    /**
     * Creates an array of entries that can be rendered and analysed.
     */
    const parsedEntries: TimeEntry[] = entries.map((key, index, _entries) => {
        const previousKey = _entries[index + 1];
        const nextKey = _entries[index - 1];
        const currentEntry = getEntryData(_data, key);
        const previousEntry = previousKey && getEntryData(_data, previousKey);
        const nextEntry = nextKey && getEntryData(_data, nextKey);

        const { timestamp, action, tag, comment } = currentEntry;

        const BeatTime = DotBeatTimeFromDate(timestamp);

        let durationHours = 0;
        let durationMinutes = 0;
        let durationBeats = 0;
        let previousBeatTime;
        let missingStop = false;
        let status = "tag";

        const weekNumber = DateTime.fromJSDate(timestamp).weekNumber;
        const year = new Date(timestamp).toLocaleString("default", { year: "2-digit" });
        const weekId = `${year}/${weekNumber}`;
        const weekDay = DateTime.fromJSDate(timestamp).weekdayShort;
        const weekDayId = `${weekId}/${weekDay}`;

        const current = DateTime.fromJSDate(timestamp);
        const currentDay = current.toISODate();

        const nextDayDT = nextEntry
            ? DateTime.fromJSDate(nextEntry.timestamp)
            : null;
        const nextDay = nextDayDT ? nextDayDT.toISODate() : null;

        const previousDayDT = previousEntry
            ? DateTime.fromJSDate(previousEntry.timestamp)
            : null;
        const previousDay = previousDayDT ? previousDayDT.toISODate() : null;

        if (previousEntry && action === "STOP") {
            const before = DateTime.fromJSDate(previousEntry.timestamp);
            const interval = Interval.fromDateTimes(before, current);
            const duration = interval.toDuration(["hours", "minutes"]);
            durationHours = duration.as("hours");
            durationMinutes = duration.as("minutes");
            // console.log('luxon', { current, before, interval, durationHours });
            previousBeatTime = DotBeatTimeFromDate(previousEntry.timestamp);
            durationBeats = parseInt(BeatTime.slice(1), 10) - parseInt(previousBeatTime.slice(1), 10);
        }

        // Last entry will show duration as to now
        if (action === "START" && !nextEntry) {
            const now = DateTime.now();
            const interval = Interval.fromDateTimes(current, now);
            const duration = interval.toDuration(["hours", "minutes"]);
            durationHours = duration.as("hours");
            durationMinutes = duration.as("minutes");
            // console.log('luxon', { current, before, interval, durationHours });
        }

        status = action && action === "START" ? "tag is-success" : "tag is-danger";

        // console.log('previousEntry', previousEntry);
        // console.log('entry', { timestamp, action, tag, comment });
        // console.log('nextEntry', nextEntry);

        if (
            action === "START" &&
            previousEntry &&
            previousEntry.action === "START"
        ) {
            missingStop = true;
        }

        if (missingStop) {
            status = "tag is-warning";
        }

        // Calculate total per day
        if (durationHours) {

            totalHours += durationHours;

            if (!days[currentDay]) {
                days[currentDay] = { duration: durationHours };
            } else {
                days[currentDay] = {
                    duration: days[currentDay].duration + durationHours,
                };
            }

            if (!weeks[weekId]) {
                weeks[weekId] = { duration: durationHours };
            } else {
                weeks[weekId] = { duration: weeks[weekId].duration + durationHours };
            }

            if (!weekDays[weekDayId]) {
                weekDays[weekDayId] = { duration: durationHours };
            } else {
                weekDays[weekDayId] = {
                    duration: weekDays[weekDayId].duration + durationHours
                };
            }

            if (
                previousEntry &&
                previousEntry.action === "START" &&
                previousEntry.tag &&
                action === "STOP"
            ) {
                if (!tags[previousEntry.tag]) {
                    tags[previousEntry.tag] = { duration: durationHours };
                } else {
                    tags[previousEntry.tag] = {
                        duration: tags[previousEntry.tag].duration + durationHours,
                    };
                }
            }

            if (
                previousEntry &&
                previousEntry.action === "START" &&
                previousEntry.tag &&
                action === "STOP" &&
                weekId &&
                weeks[weekId]
            ) {
                const tagsPerWeekId = `${weekId}/${previousEntry.tag}`;
                if (!tagsPerWeek[tagsPerWeekId]) {
                    tagsPerWeek[tagsPerWeekId] = { duration: durationHours };
                } else {
                    tagsPerWeek[tagsPerWeekId] = {
                        duration: tagsPerWeek[tagsPerWeekId].duration + durationHours,
                    };
                }
            }

            if (
                previousEntry &&
                previousEntry.action === "START" &&
                previousEntry.tag &&
                action === "STOP" &&
                weekDayId &&
                weekDays[weekDayId]
            ) {
                const tagsPerDayId = `${weekDayId}/${previousEntry.tag}`;
                if (!tagsPerDay[tagsPerDayId]) {
                    tagsPerDay[tagsPerDayId] = { duration: durationHours };
                } else {
                    tagsPerDay[tagsPerDayId] = {
                        duration: tagsPerDay[tagsPerDayId].duration + durationHours,
                    };
                }
            }
        }

        const title = parseInt(key, 10) / 1e3;

        return {
            BeatTime,
            previousBeatTime,
            weekId,
            weekDayId,
            weekNumber,
            key,
            timestamp,
            status,
            action,
            durationBeats,
            durationMinutes,
            durationHours,
            previousDay,
            currentDay,
            nextDay,
            comment,
            title,
            tag,
        };
    });

    let tagsTotalDuration = 0;
    Object.keys(tags).forEach((tag) => (tagsTotalDuration += tags[tag].duration));

    let weekTotalDuration = 0;
    Object.keys(weeks).forEach(
        (weekId) => (weekTotalDuration += weeks[weekId].duration)
    );

    // console.log('parsedEntries', parsedEntries);
    // console.log('tags', tags);
    // console.log('weekDays', weekDays);
    // console.log('tagsPerWeek', tagsPerWeek);
    // console.log('tagsPerDay', tagsPerDay);

    const statisticsProps: StatisticsProps = {
        currentWeekId,
        weeks,
        totalHours,
        tagsTotalDuration,
        days,
        entries,
        tags,
    };
    const thisWeekReportProps: ThisWeekReportProps = { currentWeekId, tagsPerWeek, currentWeekNumber, weekDays, tagsPerDay, tags };
    const timeEntriesProps: TimeEntriesProps = { parsedEntries, days };
    const dailyFlowProps: DailyFlowProps = { currentWeekId, currentWeekNumber, parsedEntries };

    return { statisticsProps, thisWeekReportProps, timeEntriesProps, dailyFlowProps };
}

export const readTimeEntries = async (opts: { replica: Earthstar.Replica }) => {
    const { replica } = opts;
    const docPath = getTimeEntriesMonthDocPath();
    await read({ replica, docPath });
}

export const addTimeEntry = async (opts: { entry?: Entry, replica: Earthstar.Replica }) => {
    const { replica, entry } = opts;

    const { action, tag, comment } = entry || {};

    let _action: string | undefined = action;
    let _tag: string | undefined = tag;
    let _comment: string | undefined = comment;

    if (!action || (action !== "START" && action !== "STOP")) {
        _action = await Select.prompt({
            message: "Action",
            options: [
                { name: "START", value: "START" },
                { name: "STOP", value: "STOP" },
            ],
        });
    }

    if (!tag) {
        /**
         * @TODO Add list of existing tags to pick from
         */
        _tag = await Input.prompt({
            message: "Enter tag",
            minLength: 2,
            suggestions: TAGS
        });
    }

    if (!comment) {
        _comment = await Input.prompt({
            message: "Enter comment",
            suggestions: COMMENTS
        });
    }

    const docPath = getTimeEntriesMonthDocPath();

    const result = await replica.getLatestDocAtPath(docPath);

    if (Earthstar.isErr(result)) {
        console.log(result.message);
        Deno.exit(1);
    }

    if (!action) {
        console.log('Please define an action!');
        return;
    }

    const today = new Date();
    const textWithTimeStamp = `${today.getTime()}\t${_action}\t${_tag}\t${_comment}`;

    let appendText = textWithTimeStamp;

    if (result?.text) {
        appendText = `${result.text}
${textWithTimeStamp}`;
    }

    await edit({ replica, text: appendText, docPath });
}

export const timeReport = async (opts: { replica: Earthstar.Replica }) => {
    const { replica } = opts;
    const docPath = getTimeEntriesMonthDocPath();

    const result = await replica.getLatestDocAtPath(docPath);

    if (Earthstar.isErr(result)) {
        console.log(result.message);
        Deno.exit(1);
    }

    // Removes potential empty new lines using the .filter()
    const entries = result?.text.split(/\r?\n/).filter(element => element);

    console.group(`
Time Report for ${docPath.split('/').slice(-1)}
`);

    const weekNumber = DateTime.now().weekNumber;
    const year = DateTime.now().year;

    console.log(`We are in week ${weekNumber} of the year ${year}.
`);

    const _data: { [key: number]: unknown } = {};

    if (entries?.length) {
        const rows: Array<string>[] = [];
        entries?.reverse().forEach((entry) => {
            const _entry = entry.split(/\t/);
            _data[parseInt(_entry[0], 10)] = { action: _entry[1], tag: _entry[2], comment: _entry[3]};
            rows.push([new Date(parseInt(_entry[0], 10)).toLocaleString(), ..._entry.slice(1)]);
        });

        const table: Table = Table.from(rows);

        console.log(table.toString());
    } else {
        console.log('Document not found.');
    }
    console.groupEnd();

    // console.log('_data', _data);
    const parsedEntries = parseTimeEntries(_data as EntryData, weekNumber, year);

    console.group(`
Rough Statistics
`);
    // console.log('parseTimeEntries', parsedEntries);
    console.log('weeks', parsedEntries?.statisticsProps.weeks);
    console.log('totalHours', parsedEntries?.statisticsProps.totalHours.toFixed(2));
    console.log('days', parsedEntries?.statisticsProps.days);
    console.log('weekDays', parsedEntries?.thisWeekReportProps.weekDays);
    console.log(`
------------------
`);
    console.groupEnd();
}