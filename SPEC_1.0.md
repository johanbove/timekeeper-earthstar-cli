# Timekeeper format

<dl>
	<dt>Namespace</dt><dd>`timekeeper`</dd>
	<dt>Version</dt><dd>1.0</dd>
</dl>

This is an application format for storing time and journal entries.

## Keypair association

No keypair association is applied.

## Time entries

Every month will start a new _doc_.

Each line in the path will consist of a tab separated time entry:

    {timestamp}\t{action}\t{tag}\t{comment}

| Key       | Description                        |
| --------- | ---------------------------------- |
| timestamp | unix epoch seconds                 |
| action    | START or STOP                      |
| tag       | aka Project or recurring task      |
| comment   | Short description for more context |

### Time entries document path

The path format of a time entry document is:

```
/timekeeper/1.0/entries/{yyyy}-{mm}
```

### Time entries document fields

The `text` property of the document is the list of entries. It can be any UTF-8
string.

## Journal entries

Every month will start a new _doc_.

Each line in the path will consist of a tab separated time entry:

    {timestamp}\t{entry}

### Journal entries document path

The path format of a journal entry document is:

```
/timekeeper/1.0/journal/{yyyy}-{mm}
```

### Journal entries document fields

The `text` property of the document is the list of entries. It can be any UTF-8
string.
